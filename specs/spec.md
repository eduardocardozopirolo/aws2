# Especificação — Sistema de Gestão de Academia

## 1. Visão geral

### Problema

Academias precisam manter informações de alunos e planos, acompanhar matrículas e consultar a ocupação de cada plano. Quando esses dados ficam em planilhas ou registros separados, a equipe pode ter dificuldade para manter cadastros atualizados, localizar documentos de matrícula e obter uma visão confiável dos alunos ativos.

### Solução proposta

Desenvolver uma aplicação web para a equipe de uma academia gerenciar planos e alunos, associar cada aluno ao plano contratado, enviar documentos de matrícula e consultar um relatório de alunos ativos por plano. Os dados estruturados serão persistidos no Amazon RDS. Os documentos serão armazenados no Amazon S3, e o processamento de um novo arquivo atualizará seus metadados no RDS.

### Objetivos

- Centralizar o cadastro de planos e alunos.
- Manter a relação entre cada aluno e seu plano contratado.
- Permitir o envio e a consulta do estado de processamento de um documento associado a um aluno.
- Apresentar à equipe um resumo da quantidade de alunos ativos em cada plano.
- Atender aos requisitos de publicação e operação definidos no enunciado do Projeto 2.

## 2. Escopo

### Incluído

- Cadastro, consulta, edição e remoção de planos.
- Cadastro, consulta, edição e remoção de alunos.
- Associação de um aluno a um plano.
- Envio de um documento de matrícula (PDF, JPEG ou PNG) associado a um aluno.
- Registro no banco de dados dos metadados e do resultado do processamento do documento.
- Relatório de alunos ativos agrupados por plano.
- Interface web publicada e integrada à API do sistema.

### Fora do escopo desta versão

- Controle de acesso por perfil, autenticação e recuperação de senha.
- Cobrança, pagamentos, emissão de notas fiscais e controle financeiro.
- Reserva de aulas, controle de presença e montagem de treinos.
- Aplicativo móvel e integração com catracas ou equipamentos da academia.
- Reconhecimento ou extração automática do conteúdo dos documentos enviados.

## 3. Usuários e personas

### Persona 1 — Marina, atendente da recepção

Recebe novos alunos, explica os planos e mantém os cadastros em dia. Precisa registrar alunos rapidamente, associá-los ao plano correto e localizar seus documentos de matrícula.

### Persona 2 — Carlos, gerente da academia

Acompanha a operação e decide quais planos divulgar ou revisar. Precisa consultar quantos alunos ativos estão associados a cada plano para entender a distribuição das matrículas.

### Persona 3 — Renata, responsável administrativa

Confere cadastros e documentos da academia. Precisa saber se o arquivo enviado para cada aluno foi recebido e processado, além de consultar os dados básicos desse arquivo.

### Persona 4 — Diego, aluno

Contrata um plano e fornece seus dados e documentos à recepção. Nesta versão, não utiliza diretamente o sistema; seus dados são registrados pela equipe da academia.

## 4. Regras de negócio

- Cada aluno deve estar associado a um plano existente.
- Um plano pode estar associado a nenhum, um ou vários alunos.
- Plano e aluno possuem estado ativo ou inativo. O relatório de ocupação considera somente alunos ativos e planos ativos.
- Não deve ser possível remover um plano enquanto houver alunos associados a ele. A equipe deve primeiro transferir esses alunos para outro plano ou inativar seus cadastros conforme a política da academia.
- Um documento enviado deve estar associado a um aluno existente.
- Para esta versão, são aceitos arquivos PDF, JPEG e PNG, respeitando o limite de tamanho definido na configuração do sistema.
- O estado do processamento de um documento deve permitir identificar se está pendente, concluído ou com falha.
- A remoção de um aluno não deve apagar automaticamente o arquivo do S3 sem uma política de retenção definida pela academia.

## 5. Histórias de usuário e critérios de aceite

### US-01 — Cadastrar um plano

**Como** atendente, **quero** cadastrar um plano com nome, descrição, preço, duração e estado, **para** disponibilizá-lo para associação a alunos.

**Critérios de aceite**

- O formulário permite informar nome, descrição, preço, duração e estado do plano.
- Nome, preço e duração são obrigatórios.
- O sistema rejeita preço menor ou igual a zero e duração menor que um dia.
- Após salvar um plano válido, ele aparece na lista de planos com os dados informados.
- Se a validação falhar, o sistema informa os campos que precisam de correção e não salva o plano.

### US-02 — Consultar, editar e remover um plano

**Como** atendente, **quero** consultar e atualizar planos, **para** manter as opções oferecidas pela academia corretas.

**Critérios de aceite**

- A lista apresenta os planos cadastrados e permite abrir seus detalhes.
- A equipe pode alterar os dados de um plano e confirmar a atualização.
- Após a atualização, a lista e os detalhes exibem os dados novos.
- A equipe pode remover um plano que não esteja associado a alunos.
- Se o plano estiver associado a um ou mais alunos, o sistema impede a remoção e explica que as associações precisam ser resolvidas primeiro.

### US-03 — Cadastrar um aluno e associá-lo a um plano

**Como** atendente, **quero** cadastrar os dados de um aluno e selecionar seu plano, **para** registrar a matrícula.

**Critérios de aceite**

- O formulário permite informar nome, e-mail, telefone, data de nascimento, estado e plano.
- Nome, e-mail e plano são obrigatórios.
- O plano selecionado deve existir e estar ativo.
- O sistema rejeita e-mails em formato inválido e informa o problema sem salvar o cadastro.
- Após salvar, o aluno aparece na lista com o plano associado.

### US-04 — Consultar, editar e remover um aluno

**Como** atendente, **quero** consultar e atualizar um cadastro de aluno, **para** corrigir dados ou refletir mudanças na matrícula.

**Critérios de aceite**

- A equipe consegue localizar alunos e consultar seus dados e plano atual.
- A equipe pode editar os dados do aluno e trocar seu plano por outro plano ativo.
- Após salvar uma alteração válida, os detalhes do aluno exibem os dados atualizados.
- A equipe pode remover um aluno após confirmar a ação.
- Uma falha de validação impede a gravação e informa o que deve ser corrigido.

### US-05 — Enviar documento de matrícula

**Como** atendente, **quero** enviar um documento associado a um aluno, **para** manter o arquivo de matrícula disponível e vinculado ao cadastro correto.

**Critérios de aceite**

- A equipe escolhe um aluno existente e um arquivo PDF, JPEG ou PNG.
- O sistema recusa tipo não permitido ou arquivo acima do limite configurado, informando o motivo.
- Para um arquivo válido, o sistema autoriza o envio ao S3 por uma URL pré-assinada gerada pelo backend.
- Após o envio, o documento aparece no cadastro do aluno com nome, tipo, tamanho e estado de processamento.
- A URL pré-assinada não é persistida como credencial nem exposta como dado permanente do cadastro.

### US-06 — Acompanhar o processamento do documento

**Como** responsável administrativa, **quero** ver o resultado do processamento de um documento, **para** confirmar que o arquivo foi recebido e registrado.

**Critérios de aceite**

- A criação do arquivo no S3 aciona o processamento automático do documento.
- O processamento registra no RDS os metadados disponíveis do arquivo, incluindo nome, tipo, tamanho, aluno associado, data de processamento e estado.
- Quando o processamento termina com sucesso, o estado exibido é “concluído”.
- Se ocorrer uma falha, o estado exibido é “com falha” e a equipe consegue identificar o documento afetado para tentar novamente ou investigar.
- O documento permanece associado ao aluno correto após o processamento.

### US-07 — Consultar alunos ativos por plano

**Como** gerente, **quero** ver a quantidade de alunos ativos em cada plano ativo, **para** acompanhar a distribuição das matrículas.

**Critérios de aceite**

- O relatório apresenta cada plano ativo e a quantidade de alunos ativos associados a ele.
- A contagem considera somente alunos e planos ativos.
- Planos ativos sem alunos ativos também aparecem com contagem zero.
- Os totais refletem os cadastros persistidos mais recentes.
- Se não houver planos ativos, o sistema exibe uma mensagem clara de que não há dados para apresentar.

### US-08 — Acessar o sistema pela interface web

**Como** membro da equipe, **quero** acessar as funções de cadastro, envio de documentos e relatório por uma interface web, **para** realizar as atividades sem interagir diretamente com a API.

**Critérios de aceite**

- A aplicação web está publicada e pode ser aberta por um endereço acessível.
- A interface permite executar as histórias de cadastro e consulta descritas nesta especificação.
- A interface apresenta mensagens de sucesso, validação e falha retornadas pela API.
- As chamadas entre a aplicação web e a API funcionam a partir do endereço publicado.

## 6. Requisitos do projeto aplicados ao domínio

| ID | Aplicação no sistema da academia | Evidência de aceite |
|---|---|---|
| RF-01 | CRUD completo de **Planos** e **Alunos** no Amazon RDS. A relação é 1:N: um plano pode ter vários alunos, e cada aluno pertence a um plano. | US-01 a US-04 permitem criar, consultar, atualizar e remover as duas entidades, respeitando a regra de associação entre elas. |
| RF-02 | Envio de um documento de matrícula PDF, JPEG ou PNG ligado a um aluno. O backend gera a URL pré-assinada e o arquivo fica no Amazon S3. | US-05 permite enviar um arquivo válido, vinculá-lo a um aluno e consultar seus metadados e estado. |
| RF-03 | Um novo documento no S3 dispara uma Lambda. Ela registra no RDS os metadados do arquivo e o resultado do processamento, associado ao aluno. | US-06 confirma o acionamento automático, a persistência dos metadados e a apresentação dos estados concluído ou com falha. |
| RF-04 | Relatório de quantidade de alunos ativos por plano ativo, implementado em Lambda e disponibilizado pelo API Gateway. A consulta agrega alunos por plano, incluindo planos sem alunos. | US-07 apresenta contagens coerentes com os cadastros e inclui planos ativos com contagem zero. A consulta exige junção e agrupamento dos dados relacionados. |
| RF-05 | Interface web da academia publicada na AWS e consumindo a API do sistema. | US-08 permite acessar a aplicação publicada e executar as funções previstas pela interface. |

## 7. Requisitos não funcionais e restrições

- **RNF-01 — Segurança de rede:** o Amazon RDS deve ficar em subnets privadas e sem acesso público. Os Security Groups e as regras de comunicação entre componentes devem ser documentados em `specs/design.md`.
- **RNF-02 — Segredos:** senhas, chaves e credenciais não devem ser incluídas no repositório.
- **RNF-03 — Retomada de sessão:** o sistema deve poder ser colocado novamente em funcionamento em uma nova sessão do Learner Lab seguindo o README, sem depender de IP público fixo no código.
- **RNF-04 — Decisão de execução do CRUD:** a escolha entre Lambda e container em EC2/ECS deve ser justificada em um ADR em `specs/design.md`.
- **RNF-05 — Provisionamento:** recursos AWS devem ser criados pelo console ou CLI; não devem ser usados CloudFormation, Terraform ou SAM.
- Lambdas que precisarem acessar o RDS devem respeitar as limitações de rede do Learner Lab. O acesso ao S3 a partir de uma Lambda na VPC deve considerar o VPC Gateway Endpoint indicado no enunciado.
- CORS deve ser configurado para a API e para o bucket S3 conforme necessário para o acesso pelo front-end.
- O custo deve ser compatível com o Learner Lab; evitar NAT Gateway ligado e utilizar recursos pequenos, conforme disponibilidade da conta.

## 8. Premissas e pontos a definir no design

- A aplicação será usada pela equipe da academia em navegador web; não haverá portal do aluno nesta versão.
- O limite máximo de tamanho do documento será definido durante o design e registrado na documentação operacional.
- Os campos físicos e restrições finais do banco, o desenho de rede, as rotas da API, os estados técnicos de processamento e a estratégia de implantação serão definidos em `specs/design.md`.
- A política de retenção e exclusão de documentos será definida pela equipe antes da implementação, respeitando a regra de que a remoção do cadastro não apaga automaticamente o arquivo no S3.
- A escolha entre inativação e exclusão de registros associados deve ser detalhada no design sem permitir que a integridade da relação aluno-plano seja violada.

