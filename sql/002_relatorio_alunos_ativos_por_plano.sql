-- RF-04: planos ativos e respectivas quantidades de alunos ativos.
-- LEFT JOIN preserva planos sem alunos; as condições de atividade mantêm
-- o resultado correto inclusive quando a contagem deve ser zero.
SELECT
    p.id AS plano_id,
    p.nome AS plano_nome,
    COUNT(a.id) AS quantidade_alunos
FROM planos AS p
LEFT JOIN alunos AS a
    ON a.plano_id = p.id
    AND a.ativo = TRUE
WHERE p.ativo = TRUE
GROUP BY p.id, p.nome
ORDER BY p.nome, p.id;
