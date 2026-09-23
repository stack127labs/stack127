# Brief: Storage Growth and TCO Planner

## Current supporting-content direction

Approved September 6, 2026. Start from measured retained data, explain compounded growth and reserve crossing, then cost assumptions and a power example. Distinguish a budget reserve from a failure forecast or a real backup.

The working tool stays first. Follow `stack127_docs/writing-style.md` for writing and visual choices. Store live copy only in the development tool-page row through the reviewed content command. Publication remains a separate operation.

## Who is here

A homelab owner is deciding whether a local storage purchase will cover the data already on disk and the growth they expect over the next few years. They know their current data size, drive price, power draw, and electricity rate, but they want the capacity runway and cost in one place.

## The job

They leave with a modeled capacity after operating reserve, a year-by-year growth runway, the first year the plan exceeds that reserve, and a transparent total cost split into hardware, power, replacement reserve, and backup budget. They do not leave with an exact ZFS free-space promise, a reliability prediction, or a universal recommendation.

## Show vs say

- The tool UI is the primary visual: one full-width workbench with clear demand, local-plan, and cost inputs.
- An exact clean chart shows projected data against capacity after reserve. It has real year labels and exact values, not marker art.
- A year-by-year table shows demand, remaining headroom, and cumulative cost. On narrow screens it becomes labelled rows instead of clipping or relying on hidden horizontal scrolling.
- A compact cost table separates hardware, power, replacement reserve, backup budget, and total TCO.
- The result headline says whether the plan clears the selected horizon and identifies the first shortfall when it does not.
- The formula receipt is a details section with short sentences, equations, assumptions, and primary links.
- Supporting prose only explains how to choose representative inputs, how the modeled capacity differs from filesystem free space, why replacement and backup are separate budgets, what the tool excludes, local-browser privacy, and what to verify next.
- There is no marker art, vendor catalog, cloud-price matrix, technology score, or long methodology essay. Exact comparisons belong in the chart and tables.
