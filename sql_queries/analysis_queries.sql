-- AI Tools Analysis — SQL queries
-- Table: ai_tools_usage(tool_name, category, job_role, adoption_score, mention_source, ai_type, year_found)
-- adoption_score = estimated % of professionals in the role using the tool regularly (0-100),
-- synthesized from 2025 industry surveys (sources in mention_source).

-- 1. Top 5 tools per role
SELECT job_role, tool_name, adoption_score
FROM (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY job_role ORDER BY adoption_score DESC) AS rn
    FROM ai_tools_usage
) t
WHERE rn <= 5
ORDER BY job_role, adoption_score DESC;

-- 2. Overall most adopted tools (average across roles)
SELECT tool_name,
       ROUND(AVG(adoption_score), 1) AS avg_adoption,
       COUNT(DISTINCT job_role)      AS roles_using
FROM ai_tools_usage
GROUP BY tool_name
ORDER BY avg_adoption DESC
LIMIT 10;

-- 3. Category distribution per role
SELECT job_role, category,
       SUM(adoption_score)                                           AS total_score,
       ROUND(100.0 * SUM(adoption_score) /
             SUM(SUM(adoption_score)) OVER (PARTITION BY job_role), 1) AS pct_of_role
FROM ai_tools_usage
GROUP BY job_role, category
ORDER BY job_role, total_score DESC;

-- 4. Cross-role tools: used by all 3 roles (the "universal" stack)
SELECT tool_name,
       COUNT(DISTINCT job_role)      AS roles,
       ROUND(AVG(adoption_score), 1) AS avg_adoption
FROM ai_tools_usage
GROUP BY tool_name
HAVING COUNT(DISTINCT job_role) = 3
ORDER BY avg_adoption DESC;

-- 5. New wave vs old guard: tools launched 2023+ vs earlier
SELECT CASE WHEN year_found >= 2023 THEN 'GenAI era (2023+)' ELSE 'Pre-GenAI' END AS era,
       COUNT(DISTINCT tool_name)     AS tools,
       ROUND(AVG(adoption_score), 1) AS avg_adoption
FROM ai_tools_usage
GROUP BY era;

-- 6. Role specialization: tools strong in exactly one role
SELECT tool_name, job_role, adoption_score
FROM ai_tools_usage u
WHERE adoption_score >= 15
  AND NOT EXISTS (
      SELECT 1 FROM ai_tools_usage u2
      WHERE u2.tool_name = u.tool_name
        AND u2.job_role <> u.job_role
        AND u2.adoption_score >= 15
  )
ORDER BY adoption_score DESC;

-- 7. AI type breakdown: which kinds of AI dominate each role
SELECT job_role, ai_type,
       ROUND(AVG(adoption_score), 1) AS avg_adoption,
       COUNT(*)                      AS tools
FROM ai_tools_usage
GROUP BY job_role, ai_type
HAVING AVG(adoption_score) >= 10
ORDER BY job_role, avg_adoption DESC;
