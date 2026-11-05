# Roteiro de validação da integração RF-01

Roteiro manual para conferir a interface, a HTTP API, a Lambda `academia-crud` e o RDS PostgreSQL. Executar com dados de teste, nunca com dados pessoais reais.

## Escopo

Este roteiro cobre o CRUD de planos e alunos. O endpoint de relatório e as rotas de documentos ainda não fazem parte da Lambda implantada.

## Preparação

1. Confirme que `frontend/config.js` aponta para a URL da HTTP API, terminada em `/v1`.
2. Confirme que CORS na HTTP API permite a origem `http://localhost:8000`, os métodos `GET`, `POST`, `PUT`, `DELETE` e `OPTIONS`, e o cabeçalho `content-type`. Para o teste no navegador, a configuração atual também pode estar usando `*` temporariamente.
3. Na raiz do repositório, inicie o servidor local:

   ```bash
   python3 -m http.server 8000 --directory frontend
   ```

4. Abra `http://localhost:8000`. Não deve aparecer o aviso “Modo protótipo” nem dados de exemplo. Os cadastros mostrados devem vir da API.
5. Abra a URL da API terminada em `/planos` e `/alunos`. Ambas devem responder com JSON; `[]` significa que não há registros daquele tipo.

## Fluxo CRUD

Use nomes que comecem com `TESTE-` e um e-mail exclusivo para facilitar a limpeza.

1. **Criar plano:** na página Planos, crie `TESTE-PLANO-<data-hora>`, preço maior que zero e duração de 30 dias. Esperado: mensagem de sucesso e plano listado.
2. **Persistir plano:** recarregue o navegador e abra Planos. Esperado: o plano continua listado, vindo do banco.
3. **Editar plano:** altere a descrição ou o preço. Esperado: valor atualizado após salvar e após recarregar.
4. **Criar aluno:** crie `TESTE-ALUNO-<data-hora>`, use um e-mail exclusivo e associe-o ao plano de teste. Esperado: aluno aparece na lista.
5. **Persistir aluno:** recarregue a página e confirme que aluno e plano continuam relacionados.
6. **Editar aluno:** altere o telefone ou o estado ativo. Esperado: alteração permanece após recarregar.
7. **Validar restrição do banco:** com o aluno ainda vinculado, tente excluir o plano pela API. A interface bloqueia essa operação antes de chamar o servidor, então use no terminal, substituindo `<ID_DO_PLANO>` pelo ID exibido na resposta/listagem:

   ```bash
   curl -i -X DELETE "https://an1n7p8et4.execute-api.us-east-1.amazonaws.com/v1/planos/<ID_DO_PLANO>"
   ```

   Esperado: HTTP `409 Conflict`. A resposta confirma que a chave estrangeira impede excluir plano relacionado.

8. **Limpar os dados de teste:** exclua primeiro o aluno pela interface. Depois exclua o plano de teste. Esperado: ambas as remoções funcionam e os registros deixam de aparecer após recarregar.

## Evidências

Salvar capturas sem credenciais mostrando:

- `/planos` e `/alunos` respondendo pela API;
- plano e aluno de teste após recarga;
- resposta HTTP `409` ao tentar excluir o plano relacionado;
- remoção dos registros de teste.

Anotar data/hora, resultado e eventual `request_id` da API. Não registrar senha do banco nem dados pessoais reais.