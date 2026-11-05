# Reflexão final sobre o uso de IA

Atualizada em 05/11/2026.

Durante o Projeto 2, usamos o assistente Codex para apoiar a análise do enunciado, a organização da especificação e do design, a implementação do CRUD e do relatório, a preparação de instruções para a AWS e a atualização da documentação. A IA ajudou a transformar dúvidas pontuais em passos executáveis e a relacionar problemas observados no Console e nos logs ao código e à infraestrutura.

As sugestões foram tratadas como propostas, não como decisões automáticas. O grupo escolheu os recursos e executou a configuração na AWS. As orientações foram ajustadas às condições reais do ambiente: a máquina de administração era Ubuntu, o database PostgreSQL precisava ser identificado corretamente, e a falha da Lambda exigiu investigar a incompatibilidade entre `pg8000` e `scramp`. Também foi necessário corrigir o CORS e retirar dados locais de demonstração para que a interface refletisse os registros servidos pela API.

As respostas da IA foram conferidas usando capturas do Console, logs do CloudWatch, chamadas à API e os dados exibidos pela aplicação. Por exemplo, a equipe confirmou uma resposta HTTP 200 para a rota do relatório, com os planos `luxo` (zero alunos ativos) e `Movimento` (um aluno ativo). Essa evidência verifica uma consulta real, mas não substitui a execução de todos os cenários de aceitação.

Na data desta reflexão, o CRUD e o relatório estão integrados à infraestrutura publicada. Assim, o trabalho com IA acelerou implementação e diagnóstico, enquanto a responsabilidade de revisar decisões, conferir evidências e concluir os requisitos permaneceu com o grupo.

> **Nota sobre a ferramenta:** os usos de IA registrados neste repositório identificam o Codex. Como o enunciado menciona GitHub Copilot, o grupo deve registrar separadamente qualquer uso do Copilot que tenha ocorrido fora destas interações; este documento não atribui ao Copilot trabalho realizado com outra ferramenta.
