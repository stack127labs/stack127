# Ad network homepage signatures

Checked 2026-10-16. I read the local identity catalog and used read-only SQLite queries on homelab. The catalog has 44 networks. Thirty-four have no program signatures. The live review cohort changed while the gather job ran, so this note does not include a live row total.

The review rule checks only script markup, including its attributes and contents. It removes the rest of the homepage before matching. A meta tag or an ad-unit `id` outside a script cannot match today. All signature proposals below use `html_substring`, which is the form supported by the rule.

## Priority findings

### SHE Media

Proposed signatures are below. The current SHE Media support article shows both the master script and the `blogherads.adq.push` ad-unit call. I found both on `1966mag.com`, `2dayitinerary.com`, and `2urbangirls.com`. I also found the master script on `sheknows.com` and `stylecaster.com`. The config and script were absent on `a1.ro`.

Confidence is high. The script and queue call are current on five publisher homepages and specific to SHE Media.

### Media.net

No safe homepage signature found. Media.net's current publisher page says it provides one publisher ad tag, but does not show its current code. The sampled Media.net cohort pages `20min.ch` and `247wallst.com` did not show a direct Media.net tag. `24h.com.vn` could not be resolved. A generic `media.net` substring is unsafe: it matched a `tcf-media.net` consent-vendor key in scripts on `2dayitinerary.com`, `ketodietguide.net`, and `blog-rct.com`. I did not find `contextual.media.net`, `nmedianet.js`, or `dmedianet.js` on those pages. The string `tcf-media.net` is not evidence of Media.net ad use.

Confidence in the no-safe result is high for the checked pages. Keep the links in review until a current Media.net ad tag or site configuration is confirmed.

### Concert

No safe homepage signature found. `allhiphop.com` and `apartmenttherapy.com` had no Concert-specific script or config. `afar.com` returned empty HTML, so it is not a valid negative. Requests to the known Vox sites `vox.com` and `theverge.com` failed DNS resolution in this check. Vox's public description presents Concert as a publisher-led marketplace and SSP, but I found no current publisher-side tag or config that distinguishes it from a site's regular ad stack.

Confidence is medium. A distinctive publisher signal may exist in private onboarding material, but I found no public, current one that is safe to match.

### Sovrn

No safe homepage signature found. Sovrn's current support article says a `lijit.com` mention alone is not enough to attribute an ad to Sovrn. It identifies a specific `lijit.com/<endpoint>/impression` pixel inside an ad impression. That pixel is not a stable homepage tag. I found no `ap.lijit.com` tag on `1043wowcountry.com` or `123greetings.com`; `1001fonts.com` and `techraptor.net` could not be fetched as HTML. `4gnews.pt` contained the word `sovrn` in a script, but no Sovrn host or tag path.

Confidence is high that a plain `sovrn.com` or `lijit.com` substring is unsafe. The older `fpi.js` tag appears in Sovrn's historic publisher guidance, but I did not find it on the current samples, so I do not recommend adding it yet.

## Other networks with no signatures

The four priority networks above are part of the 34-network zero-signature group. The pages below cover the other 30. I selected up to three current review-cohort pages per network. Failed DNS, empty HTML, redirects, and timeouts are marked as unavailable, not as evidence that a network is absent. The shared false-positive controls for proposed signatures were `a1.ro`, `at5.nl`, and `crosswordsolver.com`, except for Publisher Collective, where `crosswordsolver.com` was the positive site and controls were `a1.ro`, `at5.nl`, and `15min.lt`. Each control came from a different review cohort.

| Network | Review pages checked | Finding | Confidence |
| --- | --- | --- | --- |
| Raptive | `atlantablackstar.com`, `benzinga.com` (no HTML), `britannica.com` (DNS failed) | No safe signal found. | Low |
| Newor Media | `allbestapps.net`, `cliptics.com`, `cyn-lynn.blogspot.com` | No unique Newor script or config found. Newor describes its HeaderPlus product but publishes no current tag pattern in the public source checked. | Medium |
| AdPushup | `2689web.com`; also `123greetings.com` | Current tag found on both. Proposed signature below. | High |
| Ezoic | `a2zwordfinder.com` (no HTML), `almjhar.com`, `assammirror.com` | Ezoic's current docs show `www.ezojs.com/ezoic/sa.min.js` and `ezstandalone` config, but neither was present in the readable cohort pages. No safe live signal verified. | Medium |
| Monumetric | `clashbases.de`, `cleobuttera.com` | No Monumetric tag found. The second page has SHE Media's tag. | Medium |
| Setupad | `2ip.io` (no HTML), `381info.com` (DNS failed), `akcijuleidinys.lt` | No Setupad-specific signal found on the readable page. | Low |
| Playwire | `addictinggames.com` (no HTML), `adnetplus.tv`, `boxrox.com` (timeout) | No safe signal found. | Low |
| Freestar | `a1.ro`, `accuradio.com`, `boredpanda.com` (too many redirects); known publisher `9and10news.com` | `9and10news.com` had a `freestar` script marker, but no `a.pub.network` tag or unique ad config was present in the fetched script markup. Freestar says `a.pub.network` serves its Pubfig script, but I could not verify that signal on a live sample. No safe signal verified. | Medium |
| Publift | `androidkosmos.de` (timeout), `anonymsms.com`, `appinn.com` | No Publift tag found. `anonymsms.com` had a consent-vendor marker containing `tcf-media.net`, not a Media.net ad tag. | Medium |
| Refinery89 | `4-4-2.com`, `4devs.com.br`, `avvocatoandreani.it` (all DNS failed) | No safe signal verified. | Low |
| NitroPay | `artofmtg.com`, `peekaboor6.com`; `dak.gg` | Current NitroPay tags found on the first two. Proposed signature below. | High |
| Aditude | `amazinggamesnetwork.com`, `arkadium.com`, `avforums.com` (no HTML) | No unique Aditude tag found. Aditude describes publisher ad infrastructure, but its public page does not give a current site tag. | Medium |
| Publisher Collective | `crosswordsolver.com`; `calculator-online.net`; `codesdb.com` (DNS failed) | `crosswordsolver.com` loads `cdn.snigelweb.com/adengine/crosswordsolver.com/loader.js`. Proposed signature below. Controls `a1.ro`, `at5.nl`, and `15min.lt` had no Snigel tag. The same page loads `scripts.opti-digital.com/modules/`; that module alone is not evidence of Opti Digital membership. | High |
| Clickio | `0221.com.ar` and `24-horas.mx` (no HTML), `4gnews.pt` | Clickio's current docs show `s.clickiocdn.com/t/<site-id>/360_light.js`, but I did not find it in these cohort pages. No safe live signal verified. | Medium |
| PubNation | No review-cohort rows | No live publisher example was available in this cohort. No safe signal verified. | Low |
| Snack Media | `at5.nl`, `balls.ie`, `bleachmx.fr` | No Snack Media-specific tag found. `at5.nl` is a negative control for the proposed signatures. | Medium |
| Opti Digital | `ads.teamblind.com`, `adverge.ai`, `amitie.fr` (DNS failed) | No safe standalone signal found. The Opti script on `crosswordsolver.com` is part of a Snigel/Publisher Collective setup and would create a false positive if treated as membership. | Medium |
| Adnimation | `24hourpassportandvisas.com`, `abc3340.com`, `airpano.com` | No Adnimation tag found. `abc3340.com` has a Taboola script. | Medium |
| AnyMind / AnyManager | `097.com.tw` and `24h.com.vn` (DNS failed), `881903.com` | No unique AnyManager script or config found. Its tag service can use third-party ad systems, so generic adapters are not safe. | Low |
| Venatus | `agar-ar.com` (no HTML), `angrygamez.com` and `bluewizard.com` (DNS failed) | No safe signal verified. | Low |
| Adapex | `abc12.com`; `24hourcampfire.com` (DNS failed), `9and10news.com` | `abc12.com` loads `cdn.adapex.io/hb/aaw.empowerlocal_a.js`. Proposed signature below. The tag was absent from `a1.ro`, `at5.nl`, and `crosswordsolver.com`. | Medium-high |
| PubPower | `123ru.net`, `9minecraft.net`, `abcya3.net` | No PubPower tag found. `123ru.net` has The Moneytizer's tag. | Medium |
| PubGalaxy | `112amersfoort.nl`, `112amsterdam.nl`, `112apeldoorn.nl` (no HTML) | No signal could be checked. No safe signal verified. | Low |
| Infolinks | `280living.com`; `13.cl`; `1point3acres.com` (no HTML) | `280living.com` loads `resources.infolinks.com/js/infolinks_main.js`. Proposed signature below. It was absent from `a1.ro`, `at5.nl`, and `crosswordsolver.com`. The vendor's public guide is old, but the tag is live on this 2026 homepage. | Medium |
| The Moneytizer | No review-cohort rows; checked `123ru.net` and `blog-rct.com` | Both pages load `ads.themoneytizer.com/s/gen.js` and `s/requestform.js`. Proposed signature below. It was absent from `a1.ro`, `at5.nl`, and `crosswordsolver.com`. | High |
| Sparteo | `blog-rct.com`, `consoglobe.com`, `culturepsg.com` | No Sparteo tag found. `blog-rct.com` has The Moneytizer and Taboola scripts. | Medium |
| MonetizeMore / PubGuru | No review-cohort rows | No live publisher example was available in this cohort. No safe signal verified. | Low |
| PubFuture | No review-cohort rows | No live publisher example was available in this cohort. No safe signal verified. | Low |
| Geniee SSP | No review-cohort rows | No live publisher example was available in this cohort. No safe signal verified. | Low |
| Publir | No review-cohort rows | No live publisher example was available in this cohort. No safe signal verified. | Low |

## Proposed signatures

These use the current `program_signatures` shape. The review rule already requires the exact current ads.txt system, seller ID, and relationship type. I have not added `requires_direct_ad_system_domains`, because that would reject a valid RESELLER row when the publisher has no DIRECT line for the same system.

### SHE Media

```json
[
  {
    "kind": "html_substring",
    "value": "ads.blogherads.com/static/blogherads.js",
    "relationship_type": "active_network_use",
    "source_url": "https://support.shemedia.com/hc/en-us/articles/32102543764763-Why-isn-t-my-site-passing-the-Configure-Ads-step"
  },
  {
    "kind": "html_substring",
    "value": "blogherads.adq.push",
    "relationship_type": "active_network_use",
    "source_url": "https://support.shemedia.com/hc/en-us/articles/32102543764763-Why-isn-t-my-site-passing-the-Configure-Ads-step"
  }
]
```

### Adapex

```json
[
  {
    "kind": "html_substring",
    "value": "cdn.adapex.io/hb/aaw.",
    "relationship_type": "active_network_use",
    "source_url": "https://adapex.io/"
  }
]
```

### AdPushup

```json
[
  {
    "kind": "html_substring",
    "value": "cdn.adpushup.com/",
    "relationship_type": "active_network_use",
    "source_url": "https://www.adpushup.com/"
  }
]
```

### Infolinks

```json
[
  {
    "kind": "html_substring",
    "value": "resources.infolinks.com/js/infolinks_main.js",
    "relationship_type": "active_network_use",
    "source_url": "https://www.infolinks.com/wp-content/uploads/2016/03/Optimization-guide-2016.pdf"
  }
]
```

### NitroPay

```json
[
  {
    "kind": "html_substring",
    "value": "s.nitropay.com/ads-",
    "relationship_type": "active_network_use",
    "source_url": "https://nitropay.com/docs/installing-the-ad-script-on-your-page/"
  }
]
```

### Publisher Collective

```json
[
  {
    "kind": "html_substring",
    "value": "cdn.snigelweb.com/adengine/",
    "relationship_type": "active_network_use",
    "source_url": "https://www.publisher-collective.com/faq"
  }
]
```

### The Moneytizer

```json
[
  {
    "kind": "html_substring",
    "value": "ads.themoneytizer.com/s/gen.js",
    "relationship_type": "active_network_use",
    "source_url": "https://us.themoneytizer.com/publisherguide"
  }
]
```

### Mediavine signature change

Replace the current broad `scripts.mediavine.com` value and remove its `requires_manager_domains` condition. The current review rule routes manager-domain rows before checking page signatures, so that condition cannot help this cohort.

```json
[
  {
    "kind": "html_substring",
    "value": "scripts.mediavine.com/tags/",
    "relationship_type": "active_network_use",
    "source_url": "https://help.mediavine.com/switching-your-script-wrapper-to-the-mediavine-control-panel-plugin"
  }
]
```

The path is documented by Mediavine and its script host appeared on `crystalsandjewelry.com` and `fanbanter.co.uk`. The signal was absent from controls `a1.ro`, `at5.nl`, and `crosswordsolver.com`. Confidence is medium-high.

## Networks with one or two current signatures

| Network | Existing count | Finding | Confidence |
| --- | ---: | --- | --- |
| Journey by Mediavine | 1 | The current `journeymv.com` value is a brand-domain substring, not a confirmed ad tag. Its `requires_manager_domains` condition also cannot match the review flow. No Journey-specific tag was found on `ketodietguide.net`, `peekaboor6.com`, or `stylepersuit.com`. No safe separate signature found. | Medium |
| Mediavine | 1 | Replace with the exact `/tags/` signature above and remove the manager-domain condition. | Medium-high |
| Google AdSense | 1 | Keep the account match. It compares the DIRECT seller ID with the page's `ca-pub-` account, which is specific. | High |
| Taboola | 2 | Keep the `cdn.taboola.com/libtrc/` and `static.tblcontent.com/libtrc/` paths. Taboola domains appeared in script markup on `abc3340.com` and `almjhar.com`; I did not capture the full path from those pages. The existing DIRECT-only guard may block a valid RESELLER review row. | High |
| Teads | 2 | Keep the `a.teads.tv/page/` and `widgets.outbrain.com/outbrain.js` paths. A Teads host appeared on `15min.lt`. The existing DIRECT-only guard may block a valid RESELLER review row. | High |
| Amazon Publisher Services | 1 | Keep the exact `apstag.js` path. Amazon ad-system hosts appeared on `4gnews.pt` and `1043wowcountry.com`, but I did not verify the full `apstag.js` path on them. The DIRECT-only guard may block a valid RESELLER row. | Medium |
| MGID | 1 | Keep `jsc.mgid.com`, which is the vendor's documented widget host. It was not present on `180grados.digital` or `3bmeteo.com`; `24tv.ua` returned no HTML. The DIRECT-only guard may block a valid RESELLER row. | Medium |
| Revcontent | 2 | Keep the two Revcontent delivery paths. The source documents the vendor's delivery script. There were no current review rows for this network to sample. | Medium |
| BuySellAds / Carbon Ads | 2 | Keep the Carbon Ads and BuySellAds paths with the discovery-source requirement. There were no current review rows for this network to sample. | Medium |
| EthicalAds | 2 | Keep the client script and publisher-data marker with the discovery-source requirement. There were no current review rows for this network to sample. | Medium |

The existing direct-only guard also appears on Revcontent. Review its behavior if any of its candidates include RESELLER rows. A current exact page tag plus the exact current ads.txt line is enough for the rule in `dev-space/ad-networks-review-rules.md`.

## Sources

- [SHE Media tag verification and code example](https://support.shemedia.com/hc/en-us/articles/32102543764763-Why-isn-t-my-site-passing-the-Configure-Ads-step)
- [Media.net publisher program](https://www.media.net/ads/publisher-program/)
- [Vox Media on the Concert SSP](https://www.voxmedia.com/2022/6/7/23157157/vox-media-concert-ssp-publisher-led-supply-side-platform-trade-desk-as-an-exclusive-launch-partner/)
- [Sovrn on when a `lijit.com` impression pixel identifies an ad](https://knowledge.sovrn.com/kb/how-do-i-report-a-bad-ad)
- [Sovrn on the older `fpi.js` publisher tag](https://www.sovrn.com/blog/announcing-ssl-encryption/)
- [Ezoic current JavaScript integration](https://docs.ezoic.com/docs/ezoicads/integration/)
- [Clickio current tag implementation](https://docs.clickio.com/books/clickio-publisher-platform/page/clickio-tags-implementation-guide)
- [Freestar domain and Pubfig script](https://freestar.com/glossary/)
- [Mediavine current script wrapper path](https://help.mediavine.com/switching-your-script-wrapper-to-the-mediavine-control-panel-plugin)
- [NitroPay publisher script](https://nitropay.com/docs/installing-the-ad-script-on-your-page/)
- [Publisher Collective and Snigel relationship](https://www.publisher-collective.com/faq)
- [The Moneytizer publisher integration guide](https://us.themoneytizer.com/publisherguide)
- [Infolinks integration guide](https://www.infolinks.com/wp-content/uploads/2016/03/Optimization-guide-2016.pdf)
- [Taboola web tag](https://developers.taboola.com/web-integrations/docs/js-tag)
- [Teads web tag](https://support.teads.tv/support/solutions/articles/36000019056)
- [Outbrain web tag](https://developer.outbrain.com/outbrain-javascript-implementation-guide/)
- [Amazon Publisher Services overview](https://aps.amazon.com/aps/wp-content/uploads/2022/09/aps_overview_092223.pdf)
- [MGID widget code](https://help.mgid.com/mgid-widget-code-direct-installation)
- [Revcontent publisher delivery code](https://help.revcontent.com/knowledge/publisher-sub-id-tracking)
- [BuySellAds publisher site](https://www.buysellads.com/publishers)
- [Carbon Ads publisher site](https://discover.buysellads.com/carbon)
- [EthicalAds publisher guide](https://www.ethicalads.io/publisher-guide/)
- [Google AdSense account matching](https://support.google.com/adsense/answer/7584263?hl=en)
