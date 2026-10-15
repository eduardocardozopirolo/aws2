# Projeto 2 — Sistema de Gestão de Academia

Este diretório reúne a primeira etapa do projeto acadêmico: definição do problema, especificação inicial, proposta de arquitetura e protótipo estático da interface para uma academia.

## O que foi feito nesta etapa

- Escolhido o domínio de uma academia, com foco no cadastro de planos e alunos, documentos de matrícula e relatório de alunos ativos por plano.
- Criada a especificação do produto em [`specs/spec.md`](specs/spec.md), com personas, regras de negócio, histórias de usuário, critérios de aceite e relação com os requisitos RF-01 a RF-05.
- Registrado o design proposto em [`specs/design.md`](specs/design.md), incluindo diagramas de arquitetura e modelo ER, rotas da API, regras de rede e um ADR que propõe executar o CRUD em AWS Lambda.
- Criado em [`frontend/`](frontend/) um protótipo web estático com telas de visão geral, alunos, planos, documentos e relatórios.
- Registrado o uso de IA e as decisões pendentes em [`docs/ia-log.md`](docs/ia-log.md).

## Estado atual

O front-end pode ser aberto localmente ou publicado como site estático no Amazon S3. Enquanto `frontend/config.js` não tiver a URL da API, ele funciona em modo de protótipo com dados demonstrativos armazenados no navegador; os cadastros e envios não são persistidos no RDS ou S3.

Esta etapa ainda não inclui backend, banco de dados, recursos AWS provisionados nem publicação do site. O README será ampliado nas próximas etapas com as instruções completas para criar a infraestrutura manualmente, executar o sistema e publicá-lo conforme o enunciado.

## Abrir o protótipo

Abra [`frontend/index.html`](frontend/index.html) em um navegador. Para configurar a integração e a publicação em S3, consulte [`frontend/README.md`](frontend/README.md).

