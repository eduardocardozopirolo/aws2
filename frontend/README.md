# Front-end da academia

Site estático, sem etapa de build. Os arquivos podem ser hospedados diretamente em um bucket S3 configurado para site estático.

## Abrir o protótipo

Abra `index.html` em um navegador. Sem URL de API configurada, a interface usa dados demonstrativos gravados no armazenamento local do navegador. O aviso “Modo protótipo” informa que cadastros e documentos não são enviados à AWS; o envio de documentos é apenas simulado.

## Conectar à API

Edite `config.js` e preencha `API_BASE_URL` com a URL base do API Gateway, incluindo o estágio e o prefixo `/v1` quando aplicável. Exemplo:

```js
window.APP_CONFIG = {
  API_BASE_URL: "https://abc123.execute-api.us-east-1.amazonaws.com/v1",
  MAX_UPLOAD_MB: 10
};
```

O front-end espera os recursos descritos em `../specs/design.md`. As respostas de listagem podem ser arrays JSON ou objetos com `items` ou `data`. A resposta de `/relatorios/alunos-ativos-por-plano` deve conter linhas com nome do plano e quantidade de alunos, por exemplo:

```json
[
  { "plano_id": 1, "plano_nome": "Essencial", "quantidade_alunos": 12 }
]
```

Para emissão de URL de upload, a interface envia `fileName`, `contentType` e `sizeBytes` e espera `uploadUrl` (ou `upload_url`). O navegador envia o arquivo diretamente ao S3 por `PUT`. A API e o bucket privado precisam permitir CORS para o domínio do site.

## Publicar no S3

1. Crie/configure o bucket destinado ao site estático e habilite o recurso de hospedagem de site estático com `index.html` como documento de índice.
2. Se usar `config.js` com URL da API, defina essa URL antes de publicar. Não coloque senhas, chaves ou credenciais neste arquivo.
3. Envie `index.html`, `styles.css`, `app.js` e `config.js` para a raiz do bucket do site. O `README.md` é documentação e não precisa ser publicado.
4. Deixe o bucket separado dos arquivos privados dos alunos. A política de leitura pública deve se aplicar somente ao conteúdo estático do site, conforme as regras do Learner Lab.
5. Abra a URL do site e confirme manualmente que a página carrega. Se a API estiver configurada, confira também a origem CORS no API Gateway e o CORS do bucket privado de documentos.

O protótipo usa fonte do Google Fonts quando há conexão externa; se ela não carregar, o navegador usa fontes locais de fallback.
