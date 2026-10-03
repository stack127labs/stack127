# Brief: SaaS tools

## Reader and task

A solo SaaS founder or operator has a specific business question and their own monthly figures. They need to choose a calculator that matches the question, enter a consistent reporting period, and understand which result can be trusted from the figures supplied.

This catalog starts with the SaaS Metrics Calculator. It gives a one-month view of recurring revenue movements, retention, customer churn, margin, and acquisition cost. The planned 40 focused tools can extend the collection into pricing, sales, forecasts, retention, and other SaaS decisions as each is built and reviewed. The catalog must only display published tools; it must not imply that planned tools are already available.

## Page and visual plan

Use the shared server-rendered tool catalog route, shell, EntryHero, sidebar, and card grid. The introduction names the questions a reader can start with. Each card uses its own short task-focused name and description. Keep the card grid easy to scan as it grows; membership and display order live in the database, not route code.

The catalog hero and homepage card use one wordless marker drawing: a starting recurring-revenue column points to an end-of-month column. The drawing represents a monthly snapshot and carries no amounts, benchmarks, or claim that revenue always rises. Its icon remains a small identity cue beside the title.

## Source of truth and launch

`public.stack127_pages` owns the flat `/saas-tools` URL, publication and SEO. `public.stack127_catalog_pages` owns the heading, intro, section heading, order, and art keys. `public.stack127_tool_catalog_memberships` owns card placement; `public.stack127_tool_pages` owns each tool's card copy and art.

Create the catalog registry and content rows unpublished. The first tool integration adds its tool row and primary membership at display order 1. Review the real desktop and mobile page with that card, its link, title, canonical, both themes, and homepage art before publishing the catalog. Never publish an empty catalog.
