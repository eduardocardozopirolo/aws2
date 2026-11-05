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

## Registro — remoção dos dados de demonstração e roteiro de integração

- **Etapa:** Integração do front-end com a API (RF-01)
- **Data:** 04/11/2026
- **Ferramenta:** Assistente de IA nesta conversa (Codex).
- **Solicitação:** Remover exemplos locais que podiam ser confundidos com registros do RDS e preparar um fluxo de validação da integração.
- **Resultado gerado:** O front-end deixou de carregar dados iniciais e persistir cadastros em `localStorage`; sem API configurada, exibe listas vazias e um aviso. O painel de aluno informa que documentos ainda não estão integrados, sem simular uploads. As mensagens de erro agora também exibem a propriedade `mensagem` retornada pelo backend. Foi criado `docs/evidencias/roteiro-integracao-rf01.md` com um fluxo CRUD manual e a conferência da restrição de chave estrangeira.
- **Decisão do grupo:** O grupo deve executar o roteiro usando registros de teste e salvar capturas sem credenciais ou dados pessoais reais.
- **Limites da validação:** O roteiro foi documentado, mas não foi executado nesta sessão. Relatório e documentos continuam fora da integração implantada.

## Registro — Implementação preparada para a entrega de 23/10

- **Etapa:** Schema e CRUD de planos/alunos
- **Data:** 22/10/2026
- **Ferramenta:** Assistente de IA nesta conversa (Codex).
- **Solicitação:** Implementar a tarefa da entrega de 23 de outubro seguindo o projeto, o enunciado e as restrições do Learner Lab.
- **Resultado gerado:** Adicionados o schema PostgreSQL em sql/001_schema.sql, o handler Lambda de CRUD em backend/crud_lambda.py, o empacotador e as instruções de implantação no README; criado specs/tasks.md com estados separados para trabalho local e ações pendentes na AWS.
- **Decisão do grupo:** Código e documentação ficam preparados para revisão. VPC, RDS, Lambda/API publicados e demonstração não foram marcados como concluídos porque esta sessão não tem AWS CLI nem credenciais AWS configuradas. O grupo deve executar e validar esses passos na conta do laboratório.

## Registro — configuração inicial da infraestrutura no Learner Lab

- **Etapa:** Rede, RDS e aplicação do schema
- **Data:** 03/11/2026
- **Ferramenta:** Assistente de IA nesta conversa (Codex).
- **Solicitação:** Revisar o design, orientar passo a passo a configuração manual da VPC, endpoint do S3, DB subnet group, Security Groups e RDS e registrar o progresso real no repositório.
- **Resultado gerado:** Foram analisados o enunciado e os artefatos do projeto; o assistente interpretou capturas do Console e orientou a criação de uma subnet privada em AZ diferente, a associação do endpoint Gateway do S3 às route tables privadas, a criação do DB subnet group e a implantação do RDS com acesso público desativado. Também orientou uma EC2 Ubuntu temporária para executar o schema, incluindo instalação do cliente PostgreSQL e correção do nome do database. README.md, specs/design.md, specs/tasks.md e docs/evidencias/infraestrutura.md foram atualizados com o estado atual; este registro foi acrescentado ao ia-log.
- **Decisão do grupo:** O grupo confirmou a criação da subnet privada 10.20.13.0/24 em us-east-1a, o endpoint S3, o DB subnet group, o RDS privado, os Security Groups e a criação do database academia. Após o erro inicial de database inexistente, o grupo criou o database, reaplicou o schema, confirmou que \dt lista planos e alunos e removeu a regra temporária de sg-admin-db. As capturas ainda não foram salvas no repositório.
- **Limites da validação:** O assistente não acessou a conta AWS. O estado foi atualizado a partir das capturas e confirmações do grupo. Ainda faltam evidências persistidas de \dt e a confirmação dos IDs/regras finais dos Security Groups e do encerramento da EC2.

## Registro — Preparação do repositório para publicação no GitHub

- **Etapa:** Revisão final da documentação e do versionamento
- **Data:** 05/11/2026
- **Ferramenta:** Assistente de IA nesta conversa (Codex).
- **Solicitação:** Atualizar os arquivos necessários para enviar o projeto ao GitHub após o encerramento do desenvolvimento.
- **Resultado gerado:** README raiz reescrito com visão geral, estado confirmado, execução local, empacotamento da Lambda, testes e notas de segurança. Criado `.gitignore` para ignorar segredos locais, caches e ZIPs de implantação. `specs/tasks.md`, `specs/design.md` e a evidência de infraestrutura foram alinhados à confirmação do grupo de que o site S3 e o CORS estão funcionando.
- **Limites e pendências:** O agente não acessou a AWS, não executou testes e não criou commit ou enviou arquivos ao GitHub. A execução documentada do CRUD, capturas de evidência, URL final do site e os requisitos de documentos e relatório permanecem pendentes no repositório.

## Registro — Envio do projeto atual para a branch main

- **Etapa:** Sincronização do projeto com o GitHub
- **Data:** 05/11/2026
- **Ferramenta:** Assistente de IA nesta conversa (Codex).
- **Solicitação:** Enviar para `main` o conteúdo do projeto aberto no VS Code, sem duplicá-lo em uma pasta aninhada.
- **Resultado gerado:** Os arquivos da aplicação, scripts, SQL, especificações e documentação estão organizados na raiz e serão enviados em um commit na branch padrão `main`. As capturas de alunos que exibem dados pessoais foram excluídas do versionamento pelo `.gitignore`; as evidências restantes foram incluídas.
- **Limites da validação:** Nenhum teste da aplicação foi executado nesta etapa. RF-02/RF-03, RF-04 e os cenários CRUD ainda pendentes permanecem descritos em `specs/tasks.md`.
