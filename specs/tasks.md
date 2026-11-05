# Plano de tarefas — Sistema de Gestão de Academia

Estado em 05/11/2026. Os itens informados pelo grupo ainda devem receber evidência verificável em docs/evidencias/.

| ID | Requisito | Tarefa | Responsável | Status |
|---|---|---|---|---|
| T01 | RNF-01 | Criar VPC, subnets em duas AZs, route tables, Internet Gateway e endpoint Gateway do S3. | Grupo | Concluído no Console; salvar capturas e registrar IDs que faltam |
| T02 | RF-01, RNF-01 | Criar DB subnet group e RDS PostgreSQL privado, sem acesso público. | Grupo | Concluído segundo capturas do Console; registrar classe/armazenamento e salvar evidências |
| T03 | RF-01 | Criar o database academia e aplicar sql/001_schema.sql; confirmar tabelas e restrições. | Grupo | Concluído segundo confirmação do grupo: \dt lista planos e alunos; salvar evidência |
| T04 | RF-01, RNF-04 | Publicar Lambda CRUD de planos e alunos, criar HTTP API, integração, CORS e variáveis de conexão sem versionar segredos. | Grupo | Lambda/API e resposta confirmadas pelo grupo; corrigida incompatibilidade pg8000/scramp; salvar evidências e resultado dos testes |
| T05 | RF-01 | Demonstrar criar, listar, editar e excluir planos/alunos, incluindo conflito ao excluir plano relacionado. | Grupo | Capturas mostram listagem integrada de planos e resposta de GET /v1/planos; evidência da listagem de alunos está local devido a dados pessoais; criar, editar, excluir e demais validações continuam pendentes |
| T06 | RNF-01 | Configurar sg-lambda-api, sg-lambda-processamento e sg-rds; restringir TCP 5432 às origens necessárias. | Grupo | Configurado segundo confirmação do grupo; conferir IDs e regras no Console |
| T07 | — | Salvar evidências de VPC, endpoint S3, RDS, SGs e schema em docs/evidencias/. | Grupo | Parcial: mapa da VPC e detalhes do RDS salvos; faltam SGs, schema e demais evidências listadas em infraestrutura.md |
| T08 | RNF-01 | Remover regra temporária de sg-admin-db e encerrar a EC2 Ubuntu após concluir o schema. | Grupo | Regra removida segundo confirmação; captura de 05/11/2026 mostra nenhuma instância EC2 na região us-east-1 |
| T09 | RF-02, RF-03 | Criar migração da tabela documentos, URL pré-assinada e fluxo S3 → Lambda → RDS. | Grupo | Pendente de implementação |
| T10 | RF-04 | Implementar relatório agregado por plano em Lambda e API Gateway. | Grupo | Pendente de implementação |
| T11 | RF-05 | Publicar front-end integrado à API e atualizar o design conforme os recursos reais. | Grupo | Site publicado no S3 e CORS corrigido segundo confirmação do grupo; salvar evidências e executar validação final |
