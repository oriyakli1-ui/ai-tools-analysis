# AI Tools Analysis — PMs, Data Analysts & Product Managers

Which AI tools actually matter for **Project Managers**, **Data Analysts**, and **Product Managers** in 2025? This project synthesizes industry surveys and job-market research into a structured dataset, SQL analysis, and a Power BI dashboard.

## Headline findings
- **ChatGPT is #1 for all three roles** (48–58% adoption) — the only tool that is universal *and* dominant.
- **Six tools form a "universal stack"** used by all three roles: ChatGPT, Microsoft Copilot, Claude, Gemini, Perplexity, GitHub Copilot.
- **Each role has a distinct AI profile:** analysts lean on BI + coding AI (49% + 18% of adoption weight), PMs on writing + research AI, project managers on embedded productivity AI (52%) — Copilot in Office, meeting bots, Jira/Asana AI.

Full findings: [insights.md](insights.md)

## Repository structure
```
data/            ai_tools_usage.csv — 55 rows: tool × role × adoption score + source
sql_queries/     analysis_queries.sql — 7 queries (top-N, category mix, universal stack, era analysis)
dashboard/       POWERBI_GUIDE.md — 4-page dashboard spec with DAX measures
                 screenshots/ — rendered charts
insights.md      key findings + methodology
```

## Data
`data/ai_tools_usage.csv` columns:

| column | meaning |
|---|---|
| tool_name | AI tool |
| category | Coding, Research, Writing, Data/BI, Design, Productivity |
| job_role | Product Manager / Data Analyst / Project Manager |
| adoption_score | estimated % of role using the tool regularly |
| mention_source | survey/report the estimate is based on |
| ai_type | kind of AI (chatbot, code assistant, meeting AI...) |
| year_found | tool launch year |

**Sources:** Lenny's Newsletter surveys (6,500+ and 1,750 respondents, 2025), Stack Overflow Developer Survey 2025, Microsoft Copilot Usage Report 2025 (37.5M conversations), Anthropic Economic Index, PMI / AI-in-PM Global Survey 2025, Pragmatic Engineer AI Tooling Survey 2026, vendor adoption reports. Scores are directional estimates, not census data — see methodology in [insights.md](insights.md).

## Reproduce
Load the CSV into any SQL engine (tested on SQLite) and run `sql_queries/analysis_queries.sql`. For the dashboard, follow `dashboard/POWERBI_GUIDE.md`.

## License
MIT
