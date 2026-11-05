"""CRUD de planos e alunos para API Gateway HTTP API (payload v2.0)."""
import json
import os
import re
import ssl
from datetime import date, datetime
from decimal import Decimal, InvalidOperation

import pg8000.dbapi

ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class HttpError(Exception):
    def __init__(self, status, message):
        self.status, self.message = status, message


def _json_default(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    raise TypeError(type(value).__name__)


def _response(status, payload=None):
    return {
        "statusCode": status,
        "headers": {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": ORIGIN,
            "access-control-allow-headers": "content-type",
            "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        "body": "" if payload is None else json.dumps(payload, ensure_ascii=False, default=_json_default),
    }


def _connect():
    required = ("DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD")
    missing = [key for key in required if not os.environ.get(key)]
    if missing:
        raise RuntimeError("Configuração ausente na Lambda: " + ", ".join(missing))
    return pg8000.dbapi.connect(
        host=os.environ["DB_HOST"], port=int(os.environ.get("DB_PORT", "5432")),
        database=os.environ["DB_NAME"], user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"], ssl_context=ssl.create_default_context(), timeout=5,
    )


def _body(event):
    raw = event.get("body")
    if not raw:
        return {}
    if event.get("isBase64Encoded"):
        raise HttpError(400, "O corpo deve ser JSON não codificado em Base64.")
    try:
        value = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        raise HttpError(400, "Corpo JSON inválido.")
    if not isinstance(value, dict):
        raise HttpError(400, "O corpo JSON deve ser um objeto.")
    return value


def _text(payload, key, label, maximum):
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise HttpError(400, label + " é obrigatório.")
    value = value.strip()
    if len(value) > maximum:
        raise HttpError(400, label + " deve ter no máximo " + str(maximum) + " caracteres.")
    return value


def _active(value):
    if value is None:
        return True
    if not isinstance(value, bool):
        raise HttpError(400, "O campo ativo deve ser booleano.")
    return value


def _id(value, label):
    try:
        result = int(value)
        if result > 0:
            return result
    except (TypeError, ValueError):
        pass
    raise HttpError(400, "Identificador de " + label + " inválido.")


def _rows(cursor):
    columns = [item[0] for item in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def _row(cursor):
    items = _rows(cursor)
    return items[0] if items else None


def _plan(payload):
    name = _text(payload, "nome", "Nome", 80)
    try:
        price = Decimal(str(payload.get("preco")))
        if not price.is_finite() or price <= 0:
            raise InvalidOperation()
    except (InvalidOperation, TypeError, ValueError):
        raise HttpError(400, "Preço deve ser um número maior que zero.")
    try:
        duration = int(payload.get("duracao_dias"))
        if duration < 1:
            raise ValueError()
    except (TypeError, ValueError):
        raise HttpError(400, "Duração deve ser um número inteiro de pelo menos um dia.")
    description = payload.get("descricao") or ""
    if not isinstance(description, str) or len(description) > 500:
        raise HttpError(400, "Descrição deve ter no máximo 500 caracteres.")
    return name, description.strip(), price, duration, _active(payload.get("ativo"))


def _student(payload):
    name = _text(payload, "nome", "Nome", 120)
    email = _text(payload, "email", "E-mail", 160).lower()
    if not EMAIL_RE.fullmatch(email):
        raise HttpError(400, "Informe um e-mail válido.")
    plan_id = _id(payload.get("plano_id"), "plano")
    phone = payload.get("telefone") or None
    if phone is not None and (not isinstance(phone, str) or len(phone) > 40):
        raise HttpError(400, "Telefone deve ter no máximo 40 caracteres.")
    birthday = payload.get("data_nascimento") or None
    if birthday:
        try:
            date.fromisoformat(birthday)
        except (TypeError, ValueError):
            raise HttpError(400, "Data de nascimento inválida; use AAAA-MM-DD.")
    return name, email, phone, birthday, plan_id, _active(payload.get("ativo"))


def _route(cursor, method, path, query, body):
    parts = [part for part in path.strip("/").split("/") if part]
    if parts and parts[0] == "v1":
        parts = parts[1:]
    if not parts:
        raise HttpError(404, "Rota não encontrada.")
    entity = parts[0]

    if entity == "planos":
        columns = "id,nome,descricao,preco,duracao_dias,ativo,criado_em,atualizado_em"
        if len(parts) == 1 and method == "GET":
            args, sql = [], "SELECT " + columns + " FROM planos"
            if query.get("ativo") in ("true", "false"):
                sql += " WHERE ativo=%s"
                args.append(query["ativo"] == "true")
            cursor.execute(sql + " ORDER BY id", args)
            return 200, _rows(cursor)
        if len(parts) == 1 and method == "POST":
            cursor.execute("INSERT INTO planos (nome,descricao,preco,duracao_dias,ativo) VALUES (%s,%s,%s,%s,%s) RETURNING " + columns, _plan(body))
            return 201, _row(cursor)
        if len(parts) == 2:
            item_id = _id(parts[1], "plano")
            if method == "GET":
                cursor.execute("SELECT " + columns + " FROM planos WHERE id=%s", (item_id,))
                result = _row(cursor)
                if not result:
                    raise HttpError(404, "Plano não encontrado.")
                return 200, result
            if method == "PUT":
                cursor.execute("UPDATE planos SET nome=%s,descricao=%s,preco=%s,duracao_dias=%s,ativo=%s,atualizado_em=now() WHERE id=%s RETURNING " + columns, _plan(body) + (item_id,))
                result = _row(cursor)
                if not result:
                    raise HttpError(404, "Plano não encontrado.")
                return 200, result
            if method == "DELETE":
                cursor.execute("DELETE FROM planos WHERE id=%s RETURNING id", (item_id,))
                if not _row(cursor):
                    raise HttpError(404, "Plano não encontrado.")
                return 204, None

    if entity == "alunos":
        columns = "id,plano_id,nome,email,telefone,data_nascimento,ativo,criado_em,atualizado_em"
        if len(parts) == 1 and method == "GET":
            where, args = [], []
            if query.get("plano_id"):
                where.append("plano_id=%s")
                args.append(_id(query["plano_id"], "plano"))
            if query.get("ativo") in ("true", "false"):
                where.append("ativo=%s")
                args.append(query["ativo"] == "true")
            sql = "SELECT " + columns + " FROM alunos"
            if where:
                sql += " WHERE " + " AND ".join(where)
            cursor.execute(sql + " ORDER BY id", args)
            return 200, _rows(cursor)
        if len(parts) == 1 and method == "POST":
            values = _student(body)
            cursor.execute("SELECT id FROM planos WHERE id=%s AND ativo=true", (values[4],))
            if not cursor.fetchone():
                raise HttpError(400, "O plano deve existir e estar ativo.")
            cursor.execute("INSERT INTO alunos (nome,email,telefone,data_nascimento,plano_id,ativo) VALUES (%s,%s,%s,%s,%s,%s) RETURNING " + columns, values)
            return 201, _row(cursor)
        if len(parts) == 2:
            item_id = _id(parts[1], "aluno")
            if method == "GET":
                cursor.execute("SELECT " + columns + " FROM alunos WHERE id=%s", (item_id,))
                result = _row(cursor)
                if not result:
                    raise HttpError(404, "Aluno não encontrado.")
                return 200, result
            if method == "PUT":
                values = _student(body)
                cursor.execute("SELECT id FROM planos WHERE id=%s AND ativo=true", (values[4],))
                if not cursor.fetchone():
                    raise HttpError(400, "O plano deve existir e estar ativo.")
                cursor.execute("UPDATE alunos SET nome=%s,email=%s,telefone=%s,data_nascimento=%s,plano_id=%s,ativo=%s,atualizado_em=now() WHERE id=%s RETURNING " + columns, values + (item_id,))
                result = _row(cursor)
                if not result:
                    raise HttpError(404, "Aluno não encontrado.")
                return 200, result
            if method == "DELETE":
                cursor.execute("DELETE FROM alunos WHERE id=%s RETURNING id", (item_id,))
                if not _row(cursor):
                    raise HttpError(404, "Aluno não encontrado.")
                return 204, None
    raise HttpError(404, "Rota não encontrada.")


def handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "GET").upper()
    if method == "OPTIONS":
        return _response(204)
    try:
        body = _body(event)
        conn = _connect()
        try:
            cursor = conn.cursor()
            status, result = _route(cursor, method, event.get("rawPath") or event.get("path") or "/", event.get("queryStringParameters") or {}, body)
            conn.commit()
            return _response(status, result)
        except HttpError:
            conn.rollback()
            raise
        except pg8000.dbapi.IntegrityError:
            conn.rollback()
            raise HttpError(409, "A operação viola uma restrição de integridade; verifique e-mail duplicado ou registros relacionados.")
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
    except HttpError as exc:
        return _response(exc.status, {"mensagem": exc.message})
    except Exception as exc:
        request_id = event.get("requestContext", {}).get("requestId", "indisponível")
        # Keep credentials out of logs and API responses, but record enough
        # context in CloudWatch to diagnose database/configuration failures.
        print(json.dumps({
            "level": "ERROR",
            "request_id": request_id,
            "message": "Falha não tratada no CRUD",
            "error_type": type(exc).__name__,
            "error": str(exc)[:500],
        }, ensure_ascii=False))
        return _response(500, {"mensagem": "Erro interno. Consulte os logs com o identificador da requisição.", "request_id": request_id})
