# Key Insights — AI Tools for PMs, Data Analysts & Product Managers

Results below are computed with the queries in `sql_queries/analysis_queries.sql` over `data/ai_tools_usage.csv` (SQLite). Adoption scores are estimates synthesized from 2025 industry surveys — see Methodology.

## 1. One universal stack, three specialized stacks
Six tools are used across all three roles — ChatGPT (53% avg), Microsoft Copilot (38%), Claude (28%), Gemini (23%), Perplexity (21%), GitHub Copilot (18%). Everything else is role-specific.

## 2. Top 5 per role
| Rank | Product Manager | Data Analyst | Project Manager |
|---|---|---|---|
| 1 | ChatGPT (58) | ChatGPT (52) | ChatGPT (48) |
| 2 | Claude (35) | Microsoft Copilot (38) | Microsoft Copilot (42) |
| 3 | Microsoft Copilot (33) | Power BI Copilot (36) | Notion AI (22) |
| 4 | Perplexity (28) | GitHub Copilot (34) | Grammarly (21) |
| 5 | Notion AI (26) | Claude (30) | Gemini (20) |

## 3. Each role leans on a different AI category
- **Data Analysts:** 49% of adoption weight in Data Analysis & BI tools; 18% in coding assistants. They are the only role where code tools (GitHub Copilot, Claude Code, Cursor) matter.
- **Product Managers:** Writing & Content leads (32%), then Productivity (25%) and Research (19%). The only role with meaningful Design/Prototyping AI usage (Figma AI, v0, Lovable).
- **Project Managers:** Productivity & Automation dominates (52%) — Copilot in Office, meeting AI (Otter, Fireflies), PM-tool AI (Jira, Asana, Monday, ClickUp).

## 4. Microsoft Copilot is the project managers' #2
Project managers show the highest Microsoft Copilot adoption (42) of the three roles — AI arrives embedded in Office/Teams rather than as a standalone tool. Consistent with Microsoft's 2025 Copilot Usage Report finding of broad-but-shallow adoption.

## 5. Claude is the clear #2 chatbot for product people
Claude ranks #2 for PMs (35) per Lenny's Newsletter surveys, and #2 among data professionals, driven by analysis and coding use. Among project managers it lags (18).

## 6. Specialists with narrow moats
Tools strong in exactly one role: Power BI Copilot, ChatGPT Advanced Data Analysis, Tableau AI, Claude Code, Cursor (analysts); Figma AI, NotebookLM (PMs); Otter.ai, Asana AI (project managers).

## Methodology & caveats
- `adoption_score` = estimated % of professionals in that role using the tool regularly. Synthesized from: Lenny's Newsletter "What's in your stack" (6,500+ responses, 2025) and AI Productivity Survey (1,750 responses, Dec 2025), Stack Overflow Developer Survey 2025, Microsoft Copilot Usage Report 2025 (37.5M conversations), Anthropic Economic Index, PMI/AI-in-PM Global Survey 2025, Pragmatic Engineer AI Tooling Survey 2026, plus vendor adoption reports.
- Where a survey did not report a role-level number, scores are interpolated from adjacent data — treat them as directional, not exact.
- Sources per row are in the `mention_source` column.
