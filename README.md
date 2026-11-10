# AI Tools Analysis — PMs, Data Analysts & Product Managers

Which AI tools actually matter for **Project Managers**, **Data Analysts**, and **Product Managers** in 2025? This project synthesizes industry surveys and job-market research into a structured dataset, SQL analysis, and a Power BI dashboard.

> **Note:** ChatGPT, Claude, and Google Gemini (general-purpose chatbots) are excluded from the dataset — they topped every role, which is trivial. The analysis covers the next tier of tools that actually differentiate the roles. Role-specific products built on those models (ChatGPT Advanced Data Analysis, Claude Code, Gemini in Google Sheets) are kept.

## Headline findings
- **Microsoft Copilot is #1 for all three roles** (33–42% adoption) — AI arrives embedded in Office/Teams.
- **Only three tools form the "universal stack"** used by all three roles: Microsoft Copilot, Perplexity, GitHub Copilot.
- **Each role has a distinct AI profile:** analysts lean on BI + coding AI (57% + 25% of adoption weight), PMs on productivity, design and research AI, project managers on embedded productivity AI (72%) — Copilot in Office, meeting bots, Jira/Asana AI.

Full findings: [insights.md](insights.md)

## Repository structure
```
data/            ai_tools_usage.csv — 46 rows: tool × role × adoption score + source
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
