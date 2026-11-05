# Front-end da academia

Site estático, sem etapa de build. Os arquivos podem ser hospedados diretamente em um bucket S3 configurado para site estático.

## Estado publicado

O grupo confirmou a publicação do site no bucket S3 `frontend291000` e que a correção de CORS permitiu a chamada da API pelo navegador. A URL pública final deve ser copiada do Console AWS e registrada em `../docs/evidencias/infraestrutura.md`. A interface implementa o CRUD de planos e alunos e consulta a rota do relatório RF-04, cuja Lambda e rota foram confirmadas como implantadas pelo grupo. Falta validar o relatório e registrar evidências. Documentos continuam pendentes.

## Abrir localmente

Defina `API_BASE_URL` em `config.js` e abra a pasta com um servidor local:

```bash
python3 -m http.server 8000 --directory frontend
```

Acesse `http://localhost:8000`. A interface não contém dados demonstrativos nem grava cadastros no armazenamento local. Se `API_BASE_URL` estiver vazio, as listas ficam vazias e aparece um aviso de configuração. Se a API não responder, aparece o erro de conexão.

## Conectar à API

Edite `config.js` e preencha `API_BASE_URL` com a URL base do API Gateway, incluindo o estágio e o prefixo `/v1` quando aplicável. Exemplo:

```js
window.APP_CONFIG = {
  API_BASE_URL: "https://abc123.execute-api.us-east-1.amazonaws.com/v1",
  MAX_UPLOAD_MB: 10
};
```

O CRUD de planos e alunos consome a API configurada. A tela de relatório consulta `/relatorios/alunos-ativos-por-plano`; o handler está em `../backend/report_lambda.py`, e o grupo confirmou que a função e a rota foram implantadas na AWS. Valide os resultados com `../docs/evidencias/plano-de-testes-aplicacao.md`. O fluxo de documentos continua pendente. Não há dados demonstrativos nem simulação nesses módulos.

O endpoint `/relatorios/alunos-ativos-por-plano` retorna linhas com nome do plano e quantidade de alunos, por exemplo:

```json
[
  { "plano_id": 1, "plano_nome": "Essencial", "quantidade_alunos": 12 }
]
```

O fluxo de documentos ainda não está ativo nesta interface. Quando os endpoints forem implantados, a API e o bucket privado precisarão permitir CORS para a origem do site.

## Publicar no S3

1. Crie/configure o bucket destinado ao site estático e habilite o recurso de hospedagem de site estático com `index.html` como documento de índice.
2. Se usar `config.js` com URL da API, defina essa URL antes de publicar. Não coloque senhas, chaves ou credenciais neste arquivo.
3. Envie `index.html`, `styles.css`, `app.js` e `config.js` para a raiz do bucket do site. O `README.md` é documentação e não precisa ser publicado.
4. Deixe o bucket separado dos arquivos privados dos alunos. A política de leitura pública deve se aplicar somente ao conteúdo estático do site, conforme as regras do Learner Lab.
5. Abra a URL do site e confirme manualmente que a página carrega. Se a API estiver configurada, confira também a origem CORS no API Gateway e o CORS do bucket privado de documentos.

O protótipo usa fonte do Google Fonts quando há conexão externa; se ela não carregar, o navegador usa fontes locais de fallback.
