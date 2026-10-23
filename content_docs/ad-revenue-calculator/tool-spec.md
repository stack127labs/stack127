# Ad revenue calculator

Route: `/ad-revenue-calculator`. Family: `tool`. Catalog: Publisher tools. Research: [research.md](research.md).

## Who and why

Bloggers and content-site owners with ads. They bring one of three questions: what will I earn at this RPM, what RPM does my CPM give, and what RPM am I getting now. They get monthly and yearly numbers side by side, labeled as page or session RPM.

## Inputs

Three tabs. No Advanced section. Traffic is per month and shared by all tabs, with its unit. Switching tabs keeps every value.

One unit choice, Pageviews or Sessions, drives the whole tool. In CPM to RPM it shows on two fields, ad impressions and traffic. Changing either one changes the other, so impressions and traffic always use the same unit.

| Tab | Label | Required | Hint | Changes |
| --- | --- | --- | --- | --- |
| All | Monthly traffic: number + `Pageviews` / `Sessions` select | Revenue, Find RPM: yes. CPM to RPM: optional | One month, from your analytics or ad dashboard. | Revenue, and every `Page` / `Session` label |
| Revenue | Page RPM (Session RPM), `$` | yes | What you earn per 1,000 pageviews (sessions). | Revenue |
| CPM to RPM | CPM, `$` | yes | What you earn for every 1,000 ad impressions, after your network's cut. | RPM |
| CPM to RPM | Ad impressions: number + `per pageview` / `per session` select | yes | Ads that load on an average page (in an average visit). | RPM, and the shared unit |
| Find RPM | Monthly ad revenue, `$` | yes | Ad earnings for the same month as the traffic. | RPM |

Layout: Revenue and Find RPM put their two fields on one row. CPM to RPM puts CPM and ad impressions on the first row, and monthly traffic alone on the row below.

Button per tab: `Calculate revenue`, `Calculate RPM`, `Find RPM`. Quiet `Reset` beside it. `Share` on the result.

## Result

- Revenue tab: Monthly revenue and Yearly revenue as two big numbers side by side. Under them, one working line.
- CPM to RPM tab: Page RPM big, with the working line. Then Monthly and Yearly revenue side by side, and monthly / yearly ad impressions as small numbers. Traffic blank: the revenue pair shows `—`.
- Find RPM tab: Page RPM big, with the working line. Then Monthly and Yearly revenue side by side.
- No chart: every relationship here is one multiplication, so a chart would repeat the numbers.

Example (opens filled, result marked `Example`): 50,000 pageviews a month.

| Tab | Inputs | Result |
| --- | --- | --- |
| Revenue | $12.00 Page RPM | $600.00 a month, $7,200.00 a year |
| CPM to RPM | $3.00 CPM, 4 ad impressions per pageview | $12.00 Page RPM, $600.00 / $7,200.00, 200,000 / 2,400,000 impressions |
| Find RPM | $600.00 ad revenue | $12.00 Page RPM, $600.00 / $7,200.00 |

## How it works

- Revenue = traffic × RPM ÷ 1,000. Yearly = monthly × 12.
- RPM = CPM × ad impressions per pageview (or session). CPM is the publisher's CPM after the network's cut, so every result is what the publisher is paid. Impressions = traffic × impressions per unit.
- RPM = revenue ÷ traffic × 1,000.
- Sources: [AdSense RPM](https://support.google.com/adsense/answer/190515), [MonetizeMore session RPM](https://www.monetizemore.com/blog/what-is-rpm-session-page-ad/).
- Money in cents with exact integer math, shown to 2 decimals, rounded half up. RPM shown to 2 decimals; under $0.01 shows `Under $0.01`.
- Validation, per field, on press: traffic a whole number 0 to 10,000,000,000 (above 0 in Find RPM); money 0 to 100,000,000 with up to 2 decimals; impressions per unit 0 to 1,000 with up to 2 decimals. Commas and `$` stripped. Errors name the field and the limit. The last good result stays, stepped back.

## Build

- `lib/ad-revenue-calculator/engine.ts`: `AD_REVENUE_EXAMPLE_INPUT`, `calculateAdRevenue(input)` → `{ status, errors, values }` for the active tab, `adRevenueShareParams`, `adRevenueInputFromQuery`.
- `app/(site)/(tools)/ad-revenue-calculator/`: `page.tsx`, `layout.tsx`, `ad-revenue-calculator.tsx`, `ad-revenue-calculator-from-url.tsx`, module CSS, `content/*.mdx`, `art/`.
- Shared: `ToolWorkbench`, `ToolFieldRow`, `ToolResult`, `UiQuantityInput` (traffic), `UiTextField` with `$` (money), `UiPrimaryResult`, `UiMetricGroup`, `UiShareAction`, `UiButton`, `UiStatus`. Tabs: `UiTabs`, extended with an optional controlled `value` / `onChange` so a share link can open a tab.
- Share params: `tab`, `traffic`, `unit`, `rpm`, `cpm`, `ipu`, `revenue`. Only the active tab's fields go in the link.
- Test: `tests/pages/ad-revenue-calculator/ad-revenue-calculator.test.mjs`, the example on each tab, sessions labels, rounding, zero traffic, and invalid input.

## Page

- Route `/ad-revenue-calculator`, primary catalog `publisher-tools`.
- Card art idea: a stack of page sheets feeding a coin jar, with a small `÷ 1,000` tag.
