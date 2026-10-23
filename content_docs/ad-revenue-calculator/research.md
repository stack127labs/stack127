# Ad revenue calculator: research

Only what changes the tool. Checked 2026-10-23.

## Who searches and what they ask

- Bloggers and content-site owners on AdSense, Ezoic, Journey, Mediavine, or Raptive. They know their monthly pageviews (or sessions) from analytics, and their RPM or CPM from their ad dashboard.
- Three questions, one per tab:
  1. "At my traffic and RPM, what would I make a month and a year?"
  2. "My network shows CPM. What does that mean per pageview?" (CPM vs RPM is one of the most common publisher explainers.)
  3. "I made $X from Y pageviews. What's my RPM?"
- Many networks (Mediavine, Raptive, MonetizeMore) report session RPM, not page RPM. People mix the two, so the tool must say which one it is everywhere.

## Formulas (primary source)

- Google AdSense: RPM = estimated earnings ÷ page views (or impressions) × 1,000. Example: $0.15 from 25 page views is a $6.00 page RPM. Source: https://support.google.com/adsense/answer/190515
- Session RPM is the same with sessions in place of pageviews. MonetizeMore example: $120.68 from 54,403 sessions is $2.22. Source: https://www.monetizemore.com/blog/what-is-rpm-session-page-ad/
- CPM is per 1,000 ad impressions. Revenue = CPM × impressions ÷ 1,000. With impressions = traffic × impressions per pageview, RPM = CPM × impressions per pageview (or per session). Follows from the two definitions above.
- Network RPM figures are usually net of the network's share (AdSense shows earnings after Google's cut). Content note, not an input.

## Competitors tried

- Pelcro RPM calculator: revenue ÷ traffic × 1,000 only. One direction. https://www.get.pelcro.com/tools/rpm-calculator
- PhysiologyWeb AdSense calculator: solve any blank cell. Flexible, but a dated grid with no page vs session choice. https://www.physiologyweb.com/calculators/google_adsense_revenue_calculator.html
- Refinery89: asks niche, country, time on page, ad units, then returns a network estimate. A sales form; invents the RPM. https://refinery89.com/meet-refinery89-ad-revenue-calculator/
- AdRevHub / AdCalc: visitors × pages per visitor × ads per page × CPM. Asks for numbers people have to work out.

Gaps this tool fills: all three directions in one place, page or session RPM named throughout, monthly and yearly side by side, and no made-up RPM.

## What we leave out

- Benchmarks or "typical RPM" ranges. Sources measure different things (page vs session, net vs gross, niche, country). Unknown beats fake precision.
- Fill rate, CTR, CPC, viewability, niche, and country. They need numbers people don't have, or they invent the answer.
- Currencies. The math is the same in any currency; the tool shows `$` because ad networks report in USD.

## Search words

1. **Main phrase:** "RPM calculator" and "ad revenue calculator". "CPM to RPM calculator" also brings in engine and machinery searches, so the page title leads with ad revenue.
2. **Words they add:** free, blog, website, page RPM, monthly.
3. **Questions:** what is RPM, CPM vs RPM, how to calculate RPM, page RPM vs session RPM, what's a good RPM.
4. **The gap:** most calculators work one way only, mix page and session RPM, or invent an RPM from niche and country.

Also checked for the copy: Mediavine calculates RPM per 1,000 sessions (https://www.mediavine.com/why-does-my-rpm-change/), and AdSense reports earnings after Google's revenue share (https://support.google.com/adsense/answer/180195).
