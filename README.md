# Sistema de Gestão de Academia

Projeto acadêmico para administrar planos e alunos de uma academia. O front-end estático consome uma HTTP API no API Gateway; a API executa o CRUD em uma função AWS Lambda conectada a um RDS PostgreSQL privado.

## Estado do projeto

Atualizado em 05/11/2026, com base no código versionado e nas confirmações do grupo. Não houve acesso direto à conta AWS nesta revisão.

- **RF-01 — planos e alunos:** handler Lambda e interface integrados à API. O grupo confirmou que API, site S3 e CORS estão funcionando. A execução completa dos casos CRUD e o salvamento das evidências ainda precisam ser registrados.
- **RF-02/RF-03 — documentos:** tabela, upload com URL pré-assinada e processamento S3 ainda não estão implementados neste repositório.
- **RF-04 — relatório:** handler, consulta e interface implementados; implantação confirmada. Uma chamada direta ao endpoint retornou HTTP 200, com dois planos, inclusive um com contagem zero. Os demais cenários ainda precisam ser validados.
- **Infraestrutura:** inventário conhecido e itens a confirmar estão em [docs/evidencias/infraestrutura.md](docs/evidencias/infraestrutura.md).

## Executar localmente

Requer Python 3 para servir os arquivos estáticos e uma API já implantada para usar os dados reais.

```bash
python3 -m http.server 8000 --directory frontend
```

Abra <http://localhost:8000>. A URL da API está em [frontend/config.js](frontend/config.js). Para apontar a interface a outra implantação, altere `API_BASE_URL`, incluindo o estágio e o prefixo `/v1` quando aplicável. Não coloque senhas, chaves ou credenciais nesse arquivo.

## Empacotar a Lambda CRUD

Requer Python 3, `pip` e `zip`:

```bash
bash backend/package.sh
```

O comando cria `backend/crud_lambda.zip`, pronto para envio à função Lambda. O ZIP é um artefato gerado e está excluído do Git. O handler configurado na AWS é `crud_lambda.handler`.

## Relatório de alunos ativos por plano (RF-04)

A função independente do relatório está em `backend/report_lambda.py`; a consulta correspondente também está documentada em `sql/002_relatorio_alunos_ativos_por_plano.sql`. Para gerar o pacote:

```bash
bash backend/package_report.sh
```

O pacote `backend/report_lambda.zip` usa o handler `report_lambda.handler`. Para ativá-lo na AWS:

1. Gere `backend/report_lambda.zip` com `bash backend/package_report.sh`.
2. Crie/atualize a Lambda `academia-relatorio` (Python 3.14, role `LabRole`, subnets privadas e SG `sg-lambda-api`), envie o ZIP e configure as variáveis `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` e `ALLOWED_ORIGIN`. Não versione a senha.
3. No API Gateway, associe a integração Lambda à rota `GET /v1/relatorios/alunos-ativos-por-plano` e implante no estágio da API.
4. Consulte `docs/evidencias/plano-de-testes-aplicacao.md` para validar o endpoint e a tela de relatórios. A implantação foi confirmada pelo grupo; a validação final ainda precisa ser registrada.

A consulta retorna todos os planos ativos e conta somente alunos ativos. O `LEFT JOIN` mantém planos sem alunos com contagem zero; planos inativos não aparecem. O front-end já chama essa rota e exibe o total e a distribuição.

## Testes e evidências

- [Plano de testes da aplicação](docs/evidencias/plano-de-testes-aplicacao.md): cobre os módulos implementados e identifica os que aguardam implementação.
- [Roteiro de integração RF-01](docs/evidencias/roteiro-integracao-rf01.md): fluxo manual entre interface, API, Lambda e RDS.
- [Infraestrutura AWS](docs/evidencias/infraestrutura.md): recursos conhecidos, fonte das informações e confirmações pendentes.

As capturas disponíveis da VPC, RDS, EC2, site de planos e resposta da API estão em `docs/evidencias/infraestrutura.md`. Capturas de alunos com dados pessoais foram mantidas localmente e ignoradas pelo Git; gere versões com dados fictícios para incluí-las no repositório público. Os resultados dos demais passos do roteiro CRUD ainda devem ser adicionados após a execução pelo grupo.

## Estrutura

```text
backend/       Lambda CRUD, dependências e script de empacotamento
docs/          evidências, plano de testes e registro de uso de IA
frontend/      site estático
specs/         enunciado detalhado, design e tarefas
sql/           schema inicial e consulta do RF-04
enunciado.md   enunciado original
```

## Segurança

O API Gateway é público para permitir acesso pelo site. O RDS permanece privado e as credenciais do banco devem existir somente na configuração da função Lambda, nunca no repositório. A API não implementa autenticação nesta versão acadêmica; use dados artificiais e não exponha dados reais.
