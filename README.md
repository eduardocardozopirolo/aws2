# Projeto 2 — Sistema de Gestão de Academia

Este repositório contém a primeira etapa do projeto acadêmico de gestão de uma academia: definição do problema, especificação inicial, proposta de arquitetura e protótipo estático da interface.

## O que foi feito nesta etapa

- Definido o domínio da academia e o escopo inicial para planos, alunos, documentos de matrícula e relatório de alunos ativos por plano.
- Criada a especificação em [`specs/spec.md`](specs/spec.md), com personas, regras de negócio, histórias de usuário, critérios de aceite e relação com os requisitos RF-01 a RF-05.
- Criado o design proposto em [`specs/design.md`](specs/design.md), com diagramas de arquitetura e modelo ER, rotas da API, regras de rede e um ADR para a execução do CRUD.
- Criado o protótipo web estático em [`frontend/`](frontend/), com telas de visão geral, alunos, planos, documentos e relatórios.
- Registrado o uso de IA em [`docs/ia-log.md`](docs/ia-log.md).

## Estrutura

- `specs/` — especificação e design do sistema.
- `frontend/` — protótipo estático e instruções de configuração/publicação.
- `docs/` — registro de uso de IA e, futuramente, evidências do projeto.
- `enunciado.md` — enunciado do Projeto 2.

## Estado atual

O front-end pode ser aberto localmente ou publicado como site estático no Amazon S3. Sem uma URL de API em `frontend/config.js`, ele funciona em modo de protótipo com dados demonstrativos armazenados no navegador; cadastros e envios não são persistidos no RDS ou S3.

Esta etapa ainda não inclui backend, banco de dados, recursos AWS provisionados nem publicação do site. O README será ampliado nas próximas etapas com as instruções completas para criar a infraestrutura manualmente, executar o sistema e publicá-lo conforme o enunciado.

## Abrir o protótipo

Abra [`frontend/index.html`](frontend/index.html) em um navegador. Para configurar a API e publicar no S3, consulte [`frontend/README.md`](frontend/README.md).
