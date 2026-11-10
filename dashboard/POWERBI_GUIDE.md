# Power BI Dashboard — Build Guide

Data source: `../data/ai_tools_usage.csv` (Get Data → Text/CSV).

## Model
Single table `ai_tools_usage`. Set `adoption_score` and `year_found` to Whole Number.

## Measures (DAX)
```dax
Avg Adoption = AVERAGE(ai_tools_usage[adoption_score])
Tool Count = DISTINCTCOUNT(ai_tools_usage[tool_name])
Roles Using = DISTINCTCOUNT(ai_tools_usage[job_role])
Universal Tools =
COUNTROWS(
    FILTER(
        SUMMARIZE(ai_tools_usage, ai_tools_usage[tool_name],
            "r", DISTINCTCOUNT(ai_tools_usage[job_role])),
        [r] = 3))
Role Share % =
DIVIDE(
    SUM(ai_tools_usage[adoption_score]),
    CALCULATE(SUM(ai_tools_usage[adoption_score]),
        ALLEXCEPT(ai_tools_usage, ai_tools_usage[job_role])))
```

## Page 1 — Overview
- Cards: `Tool Count`, `Universal Tools`, `Avg Adoption`
- Bar chart: top 10 tools by `Avg Adoption` (Top N filter on tool_name)
- Donut: adoption weight by category
- Slicer: job_role

## Page 2 — By Role
- Small multiples bar chart: tool_name by adoption_score, small multiples = job_role; or three bar charts filtered per role (Top 5 each)
- Matrix: tool_name rows × job_role columns, values = adoption_score, conditional formatting (heatmap)

## Page 3 — Trends & Insights
- Column chart: avg adoption by `year_found` (tool launch year)
- Scatter: x = Roles Using, y = Avg Adoption, detail = tool_name (universal vs niche)
- Text box with insights from `../insights.md`

## Page 4 — Category Breakdown
- 100% stacked bar: job_role axis, category legend, value = adoption_score (this is `Role Share %` visually)
- Treemap: category → tool_name, value = adoption_score
- Table: tool_name, ai_type, mention_source

## Theme
Suggested palette: #118DFF (PM), #E66C37 (Analyst), #6B007B (Project Manager). Export screenshots of each page to `dashboard/screenshots/` for the LinkedIn post.
