"""Relatório de alunos ativos por plano para API Gateway HTTP API (payload v2.0)."""
import json
import os
import ssl

import pg8000.dbapi

ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")
REPORT_PATH = "/relatorios/alunos-ativos-por-plano"


def _response(status, payload=None):
    return {
        "statusCode": status,
        "headers": {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": ORIGIN,
            "access-control-allow-headers": "content-type",
            "access-control-allow-methods": "GET,OPTIONS",
        },
        "body": "" if payload is None else json.dumps(payload, ensure_ascii=False),
    }


def _connect():
    required = ("DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD")
    missing = [key for key in required if not os.environ.get(key)]
    if missing:
        raise RuntimeError("Configuração ausente na Lambda: " + ", ".join(missing))
    return pg8000.dbapi.connect(
        host=os.environ["DB_HOST"],
        port=int(os.environ.get("DB_PORT", "5432")),
        database=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        ssl_context=ssl.create_default_context(),
        timeout=5,
    )


def handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "GET").upper()
    if method == "OPTIONS":
        return _response(204)
    if method != "GET":
        return _response(405, {"mensagem": "Método não permitido."})

    path = event.get("rawPath") or event.get("path") or "/"
    parts = [part for part in path.strip("/").split("/") if part]
    if parts and parts[0] == "v1":
        parts = parts[1:]
    normalized_path = "/" + "/".join(parts)
    if normalized_path != REPORT_PATH:
        return _response(404, {"mensagem": "Rota não encontrada."})

    conn = None
    try:
        conn = _connect()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT
                p.id AS plano_id,
                p.nome AS plano_nome,
                COUNT(a.id) AS quantidade_alunos
            FROM planos AS p
            LEFT JOIN alunos AS a
                ON a.plano_id = p.id
                AND a.ativo = TRUE
            WHERE p.ativo = TRUE
            GROUP BY p.id, p.nome
            ORDER BY p.nome, p.id
            """
        )
        columns = [item[0] for item in cursor.description]
        rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.rollback()  # Encerra a transação de leitura sem persistir alterações.
        return _response(200, rows)
    except Exception as exc:
        request_id = event.get("requestContext", {}).get("requestId", "indisponível")
        print(json.dumps({
            "level": "ERROR",
            "request_id": request_id,
            "message": "Falha ao gerar relatório de alunos ativos por plano",
            "error_type": type(exc).__name__,
            "error": str(exc)[:500],
        }, ensure_ascii=False))
        return _response(500, {
            "mensagem": "Erro interno ao gerar o relatório.",
            "request_id": request_id,
        })
    finally:
        if conn is not None:
            conn.close()
