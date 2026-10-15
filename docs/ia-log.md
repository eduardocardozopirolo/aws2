# Registro de uso de IA

Este arquivo registra usos relevantes de ferramentas de inteligência artificial no Projeto 2, incluindo o que foi solicitado, o resultado produzido e as decisões do grupo.

## Registro inicial — Especificação do sistema da academia

- **Etapa:** Especificação
- **Data:** 15/10/2026
- **Ferramenta:** Assistente de IA nesta conversa (não foi usado o GitHub Copilot nesta interação mas sim o codex como plugin no vscode).
- **Solicitação:** Ler `enunciado.md` e criar somente `specs/spec.md` para um projeto de academia, sem desenvolver a aplicação.
- **Resultado gerado:** Foi criada uma especificação para um sistema de gestão de academia. O documento descreve o problema e o escopo, quatro personas, regras de negócio, oito histórias de usuário com critérios de aceite, a aplicação dos requisitos RF-01 a RF-05 e os requisitos não funcionais e restrições do enunciado.
- **Decisão do grupo:** A especificação foi criada no repositório como ponto de partida. Ainda não há registro de revisão, correções ou rejeições feitas pelo grupo; esses itens devem ser acrescentados após a avaliação do conteúdo.

## Registro — Esclarecimento sobre este arquivo

- **Etapa:** Organização da documentação
- **Data:** 15/10/2026
- **Ferramenta:** Assistente de IA nesta conversa.
- **Solicitação:** Explicar o que é o `ia-log.md` e o que o grupo precisa registrar, com base no enunciado.
- **Resultado gerado:** Foi explicado que o registro deve resumir prompts importantes, o que a IA produziu e o que o grupo aceitou, rejeitou ou corrigiu, além de incluir uma reflexão final na entrega do projeto.
- **Decisão do grupo:** Criar este arquivo em `docs/ia-log.md` e manter um registro conciso das próximas utilizações de IA. O enunciado menciona `docs/ia-log.md` na lista de artefatos e `ia-log.md` na entrega final; o README deverá apontar para o caminho adotado.

## Registro — Design da arquitetura

- **Etapa:** Arquitetura
- **Data:** 15/10/2026
- **Ferramenta:** Assistente de IA nesta conversa.
- **Solicitação:** Criar `specs/design.md` para o sistema da academia, alinhado com a especificação e o enunciado do Projeto 2.
- **Resultado gerado:** Foi elaborado um design proposto com diagramas Mermaid de arquitetura e modelo ER, rotas da API, fluxo de upload e processamento de documentos, regras de rede/CORS e um ADR propondo executar o CRUD em Lambda.
- **Decisão do grupo:** O documento foi adicionado ao repositório como proposta. O grupo ainda precisa revisar e confirmar as decisões e restrições antes da implementação.

## Registro — Protótipo web para publicação no S3

- **Etapa:** Front-end / protótipo
- **Data:** 15/10/2026
- **Ferramenta:** Assistente de IA nesta conversa.
- **Solicitação:** Criar páginas estáticas de front-end para o sistema da academia, adequadas à publicação no S3 e alinhadas à especificação.
- **Resultado gerado:** Foi criada a pasta `frontend/` com uma interface responsiva para visão geral, alunos, planos, documentos e relatórios, além de configuração da API e instruções para publicação no S3. Sem API configurada, a interface funciona como protótipo com dados locais e avisa que os dados e envios não chegam à AWS.
- **Decisão do grupo:** O grupo deve revisar a interface e o contrato esperado da API. O protótipo ainda precisa ser configurado e publicado em um bucket S3 para ficar acessível pela internet.

## Registro — Análise de conformidade com o enunciado

- **Etapa:** Revisão de requisitos
- **Data:** 15/10/2026
- **Ferramenta:** Assistente de IA nesta conversa (Codex).
- **Solicitação:** Comparar os arquivos existentes e o estado do projeto com os requisitos e entregas do enunciado.
- **Resultado gerado:** A análise concluiu que a especificação e o design estão documentados como propostas, e que há código de front-end em modo protótipo. Não foi encontrada evidência no repositório de publicação do site no S3, conexão com uma API funcional, backend, recursos AWS, `specs/tasks.md`, README na raiz ou pasta de evidências. Também foi apontado que o ADR precisa ser confirmado pelo grupo e que o enunciado pede uso do GitHub Copilot, enquanto os registros existentes identificam o Codex.
- **Decisão do grupo:** Revisar as conclusões, confirmar as decisões de arquitetura e planejar as pendências de acordo com as datas de entrega. Não foi registrada nesta conversa uma validação do grupo nem a publicação de recursos AWS.

## Registro — Organização dos arquivos na raiz do repositório

- **Etapa:** Organização do repositório
- **Data:** 15/10/2026
- **Ferramenta:** Assistente de IA nesta conversa (Codex).
- **Solicitação:** Mover todos os arquivos do projeto para a raiz do repositório, removendo o nível de diretório `projeto2/` que escondia o README na página inicial do GitHub.
- **Resultado gerado:** Os diretórios `docs/`, `frontend/` e `specs/`, além de `enunciado.md`, foram movidos para a raiz. O README raiz foi atualizado para descrever a estrutura e o estado da primeira etapa.
- **Decisão do grupo:** A nova estrutura corresponde à organização desejada; a alteração será registrada na branch `v1`.

## Reflexão final

Adicionar esta reflexão ao final do projeto, depois de avaliar como as ferramentas de IA ajudaram, quais sugestões foram alteradas ou descartadas e como o grupo verificou o resultado.
