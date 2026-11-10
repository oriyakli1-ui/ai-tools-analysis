# Key Insights — AI Tools for PMs, Data Analysts & Product Managers

Results below are computed with the queries in `sql_queries/analysis_queries.sql` over `data/ai_tools_usage.csv` (SQLite). Adoption scores are estimates synthesized from 2025 industry surveys — see Methodology.

> **Data cleaning note:** ChatGPT, Claude, and Google Gemini (the general-purpose chatbots) were removed from the dataset. They ranked top for every role (ChatGPT 48–58, Claude 18–35, Gemini 20–26), which is trivial — everyone uses a general chatbot. The analysis focuses on the next tier: the tools that actually differentiate the roles. Role-specific products built on those models (ChatGPT Advanced Data Analysis, Claude Code, Gemini in Google Sheets) were kept.

## 1. A small universal stack, three specialized stacks
After removing the general chatbots, only three tools are used across all three roles — Microsoft Copilot (38% avg), Perplexity (21%), GitHub Copilot (18%). Everything else is role-specific.

## 2. Top 5 per role
| Rank | Product Manager | Data Analyst | Project Manager |
|---|---|---|---|
| 1 | Microsoft Copilot (33) | Microsoft Copilot (38) | Microsoft Copilot (42) |
| 2 | Perplexity (28) | Power BI Copilot (36) | Notion AI (22) |
| 3 | Notion AI (26) | GitHub Copilot (34) | Grammarly (21) |
| 4 | Figma AI (19) | ChatGPT Adv. Data Analysis (29) | Jira AI (19) |
| 5 | NotebookLM (18) | Perplexity (22) | Otter.ai (16) |

## 3. Microsoft Copilot is the real #1 workhorse
With the general chatbots excluded, Microsoft Copilot tops all three roles (33–42) — AI arrives embedded in Office/Teams rather than as a standalone tool. Consistent with Microsoft's 2025 Copilot Usage Report finding of broad-but-shallow adoption.

## 4. Each role leans on a different AI category
- **Data Analysts:** 57% of adoption weight in Data Analysis & BI tools (Power BI Copilot, Tableau AI, ChatGPT ADA); 25% in coding assistants (GitHub Copilot, Claude Code, Cursor). The only role where code tools matter.
- **Product Managers:** Productivity leads (36%), then Design & Creative (19%) and Research (18%). The only role with meaningful Design/Prototyping AI usage (Figma AI, v0, Lovable).
- **Project Managers:** Productivity & Automation dominates (72%) — Copilot in Office, meeting AI (Otter, Fireflies), PM-tool AI (Jira, Asana, Monday, ClickUp).

## 5. Specialists with narrow moats
Tools strong in exactly one role: Power BI Copilot, ChatGPT Advanced Data Analysis, Tableau AI, Claude Code, Cursor, Gemini in Google Sheets (analysts); Figma AI, NotebookLM (PMs); Otter.ai, Asana AI (project managers).

## 6. GenAI-era tools have caught up
Tools launched 2023+ now average the same adoption as pre-GenAI incumbents (16.6 vs 16.5) — the new wave closed the gap in under three years.

## Methodology & caveats
- `adoption_score` = estimated % of professionals in that role using the tool regularly. Synthesized from: Lenny's Newsletter "What's in your stack" (6,500+ responses, 2025) and AI Productivity Survey (1,750 responses, Dec 2025), Stack Overflow Developer Survey 2025, Microsoft Copilot Usage Report 2025 (37.5M conversations), Anthropic Economic Index, PMI/AI-in-PM Global Survey 2025, Pragmatic Engineer AI Tooling Survey 2026, plus vendor adoption reports.
- ChatGPT, Claude, and Google Gemini standalone chatbots are excluded (see cleaning note above).
- Where a survey did not report a role-level number, scores are interpolated from adjacent data — treat them as directional, not exact.
- Sources per row are in the `mention_source` column.
