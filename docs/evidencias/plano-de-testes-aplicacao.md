# Plano de testes da aplicação

Atualizado em 05/11/2026. Casos manuais para validar a interface publicada, a HTTP API, a Lambda CRUD, a Lambda de relatório RF-04 e o RDS. A implantação da Lambda e da rota do relatório foi confirmada pelo grupo. O caso R01 foi executado por chamada direta e retornou HTTP 200; os cenários R02–R05 ainda aguardam execução. RF-02/RF-03 (documentos) seguem sem implementação.

## Preparação e segurança dos dados de teste

1. Use a URL do site S3 e confirme que ele abre sem o aviso de API não configurada.
2. Confirme em `frontend/config.js` que `API_BASE_URL` termina em `/v1` e aponta para a HTTP API.
3. Na HTTP API, CORS deve permitir a origem exata do site, os métodos `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS` e o cabeçalho `content-type`.
4. Use somente registros artificiais com prefixo `TESTE-`. Para aluno, use um e-mail exclusivo, por exemplo `teste-<data-hora>@example.com`.
5. Registre o resultado, status HTTP e `request_id` quando houver falha. Não capture senhas, credenciais ou dados pessoais reais.

Base da API atualmente configurada:

```text
https://an1n7p8et4.execute-api.us-east-1.amazonaws.com/v1
```

## Módulo 1 — Planos (RF-01, executável)

| ID | Ação | Resultado esperado |
|---|---|---|
| P01 | Abrir a tela Planos. | A lista corresponde ao GET `/planos`; não aparecem registros de demonstração locais. |
| P02 | Criar `TESTE-PLANO-<data-hora>` com preço positivo e duração de 30 dias. | A API retorna criação bem-sucedida e o plano aparece na lista. |
| P03 | Tentar criar plano com preço 0 ou duração 0. | A interface/API rejeita a entrada; não é criado registro. |
| P04 | Editar descrição ou preço do plano de teste. | O valor atualizado aparece na lista e permanece após recarregar a página. |
| P05 | Consultar o plano pelo ID. | GET `/planos/{id}` retorna os dados do plano criado. |
| P06 | Depois de remover o aluno associado no módulo seguinte, excluir o plano de teste. | HTTP `204`; o plano deixa de aparecer após atualizar a lista. |

## Módulo 2 — Alunos e relação com planos (RF-01, executável)

| ID | Ação | Resultado esperado |
|---|---|---|
| A01 | Criar aluno `TESTE-ALUNO-<data-hora>` com e-mail exclusivo e associá-lo ao plano de teste. | A criação funciona e a lista mostra o aluno ligado ao plano correto. |
| A02 | Tentar criar aluno sem nome, sem e-mail, com e-mail inválido ou sem plano. | A solicitação é rejeitada e nenhum aluno inválido é salvo. |
| A03 | Tentar associar aluno a um plano inexistente ou inativo. | HTTP `400`; aluno não é criado/atualizado com essa associação. |
| A04 | Criar outro aluno com e-mail já usado. | HTTP `409`; o e-mail duplicado não é salvo. |
| A05 | Editar telefone, estado ativo ou plano do aluno. | A alteração aparece e permanece após recarregar. |
| A06 | Filtrar alunos por plano e por estado ativo. | GET `/alunos?plano_id={id}&ativo=true` retorna somente os alunos correspondentes. |
| A07 | Excluir aluno pela interface. | HTTP `204`; aluno desaparece da lista após atualizar. |

### Testar a restrição de exclusão do plano

Enquanto um aluno estiver associado ao plano de teste, o botão da interface pode bloquear a exclusão antes de chamar o servidor. Para validar também a restrição do banco, execute no terminal, substituindo `<ID_DO_PLANO>`:

```bash
curl -i -X DELETE "https://an1n7p8et4.execute-api.us-east-1.amazonaws.com/v1/planos/<ID_DO_PLANO>"
```

Esperado: HTTP `409 Conflict`. Depois, exclua primeiro o aluno e tente excluir o plano novamente; esperado: HTTP `204`.

## Módulo 3 — Interface, API e CORS (RF-05, parte executável)

| ID | Ação | Resultado esperado |
|---|---|---|
| W01 | Abrir a URL pública do site S3. | `index.html`, `app.js`, `styles.css` e `config.js` carregam; a navegação e os botões funcionam. |
| W02 | Abrir as telas Planos e Alunos. | Os dados carregados são os mesmos retornados por `/planos` e `/alunos`. |
| W03 | Criar/editar plano e aluno pelo site. | Chamadas JSON cruzam a origem e persistem no RDS; sem erro de CORS no console do navegador. |
| W04 | Recarregar o site. | Os dados de teste continuam no banco e aparecem novamente. |
| W05 | Conferir a configuração pública do front-end. | `config.js` contém apenas a URL da API e configurações públicas; não contém usuário ou senha do RDS. |

## Módulo 4 — Documentos e processamento S3 (RF-02/RF-03, pendente)

**Não executar ainda:** o bucket privado, a tabela/rotas de documentos e a Lambda de processamento não estão implantados no estado registrado. Quando estiverem prontos, validar:

| ID | Ação | Resultado esperado |
|---|---|---|
| D01 | Enviar PDF, JPEG e PNG abaixo do limite configurado. | Cada envio recebe URL pré-assinada, grava o objeto no bucket privado e associa os metadados ao aluno correto. |
| D02 | Enviar tipo não permitido e arquivo acima do limite. | API recusa com erro de validação; nenhum objeto/documento inválido fica registrado. |
| D03 | Acompanhar o evento `ObjectCreated` no S3. | A Lambda de processamento é acionada e grava tipo, tamanho, data e estado no RDS. |
| D04 | Reprocessar o mesmo evento/objeto. | O resultado não duplica o documento (processamento idempotente). |
| D05 | Simular falha de processamento. | O documento fica com estado `falha`, sem perder o vínculo com o aluno. |
| D06 | Tentar ler o objeto sem URL pré-assinada. | O bucket privado nega o acesso público. |

## Módulo 5 — Relatório (RF-04, implantação confirmada; validação pendente)

O handler está em `backend/report_lambda.py`, com SQL em `sql/002_relatorio_alunos_ativos_por_plano.sql`. A implantação da função e da rota `GET /v1/relatorios/alunos-ativos-por-plano` foi confirmada pelo grupo. O caso R01 foi exercitado com `curl`: recebeu HTTP/2 200 e retornou os planos ativos `luxo` (0 alunos ativos) e `Movimento` (1 aluno ativo), conforme [evidência da API do relatório](evidencia-api-relatorio-rf04.png). Execute os demais casos com dados artificiais; prepare dois planos ativos (um sem alunos), um plano inativo, alunos ativos e um aluno inativo.

| ID | Ação | Resultado esperado |
|---|---|---|
| R01 | Consultar o relatório de alunos ativos por plano. | Cada plano ativo aparece com a contagem correta de alunos ativos. |
| R02 | Inativar um aluno e atualizar o relatório. | A contagem do plano diminui em um. |
| R03 | Inativar um plano. | O plano inativo deixa de aparecer no relatório. |
| R04 | Manter um plano ativo sem alunos ativos. | O plano aparece com contagem zero. |
| R05 | Não haver planos ativos. | A interface mostra mensagem clara de ausência de dados. |

Consulta direta para conferência após a implantação:

```bash
curl -i "https://an1n7p8et4.execute-api.us-east-1.amazonaws.com/v1/relatorios/alunos-ativos-por-plano"
```

Resultado observado de R01: HTTP/2 200; JSON com plano `luxo` em quantidade zero e `Movimento` em quantidade um. Veja a captura [evidencia-api-relatorio-rf04.png](evidencia-api-relatorio-rf04.png).
