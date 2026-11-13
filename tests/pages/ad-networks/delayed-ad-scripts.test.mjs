import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseAdsTxt } from '../../../scripts/ad-networks/ads-txt.mjs';
import { verifyPublisher } from '../../../scripts/ad-networks/verify-publisher.mjs';
import { correctionConfirmation } from '../../../scripts/ad-networks/correct-homepage-misses.mjs';
import { matchNetworks } from '../../../scripts/ad-networks/matcher.mjs';
import { reviewDecision } from '../../../scripts/ad-networks/review-rules.mjs';

const fixtures = JSON.parse(readFileSync(new URL('./fixtures/delayed-ad-scripts.json', import.meta.url)));
const id = 'ca-pub-1639051418715853';
const url = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${id}`;
const network = { id: 32, slug: 'google-adsense', program_signatures: [{ kind: 'adsense_account_match' }] };
const taboola = { id: 33, slug: 'taboola', ad_system_domains: ['taboola.com'],
  program_signatures: [{ kind: 'html_substring', value: 'cdn.taboola.com/libtrc/' }] };
const parsed = parseAdsTxt('google.com,pub-1639051418715853,DIRECT\ntaboola.com,123,DIRECT');
const fetchEvidence = { checkedAt: '2026-11-13T00:00:00Z', sha256: 'hash', outcome: 'parsed', httpStatus: 200 };
function matches(html, target = network) {
  return matchNetworks({ parsed, networks: [target], fetchEvidence, homepage: { html }, discoverySources: [] }).confirmed;
}
function markup(fixture, source = url) {
  const attrs = { ...fixture.attrs, [fixture.source]: source };
  if (fixture.type !== undefined) attrs.type = fixture.type;
  return `<script ${Object.entries(attrs).map(([name, value]) => `${name}="${value}"`).join(' ')}></script>`;
}
for (const fixture of fixtures) {
  test(`${fixture.name}: exact AdSense account and html_substring both match`, () => {
    assert.equal(matches(markup(fixture))[0]?.evidence.seller_id, 'pub-1639051418715853');
    const html = markup(fixture, 'https://cdn.taboola.com/libtrc/publisher/loader.js');
    assert.equal(matches(html, taboola)[0]?.evidence.matched_signal, 'page:cdn.taboola.com/libtrc/');
    assert.equal(reviewDecision({ relationship: { evidence: { matched_signal: 'taboola.com,123,DIRECT' } },
      network: taboola, parsed, fetchResult: fetchEvidence, homepage: { html }, checkedAt: fetchEvidence.checkedAt }).decision, 'confirmed');
    assert.equal(matches(markup(fixture).replaceAll(id, 'ca-pub-1111111111111111')).length, 0);
  });
  test(`${fixture.name}: plain src follows this loader's activation code`, () => {
    for (const target of [network, taboola]) {
      const source = target === network ? url : 'https://cdn.taboola.com/libtrc/publisher/loader.js';
      const tag = markup(fixture, source).replace(fixture.source + '=', 'src=');
      assert.equal(matches(tag, target).length, fixture.plainSrc ? 1 : 0);
    }
  });
  test(`${fixture.name}: quoted, commented and inert copies do not match`, () => {
    for (const target of [network, taboola]) {
      const tag = markup(fixture, target === network ? url : 'https://cdn.taboola.com/libtrc/publisher/loader.js');
      const wrapped = ['textarea','template','style','title','xmp','iframe','noembed','noframes','noscript']
        .map(name => `<${name}>${tag}</${name}>`);
      const escaped = tag.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      for (const html of [...wrapped, `<!-- ${tag} -->`, escaped,
        ...['pre','code','blockquote'].map(name => `<${name}>${escaped}</${name}>`)]) {
        assert.equal(matches(html, target).length, 0, html);
      }
    }
  });
}

test('1040log.com LiteSpeed regression keeps the original account and seller line', () => {
  const html = '<script crossorigin="anonymous" type="litespeed/javascript" data-src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1639051418715853&#038;host=ca-host-pub-2644536267352236"></script>';
  assert.equal(matches(html)[0].evidence.matched_signal,
    'google.com,pub-1639051418715853,DIRECT + ca-pub-1639051418715853');
});

test('inline delayed and consent-held code is inconclusive without a source attribute', () => {
  for (const type of ['litespeed/javascript','rocketlazyloadscript','text/rocketlazyloadscript','pmdelayedscript','PenciLazyScript',
    '38dea565cbb8e5075013007e-text/javascript','text/plain']) {
    const html = `<script type="${type}" data-cookieconsent="marketing">adsbygoogle.push({google_ad_client:'${id}'});</script>`;
    assert.equal(matches(html).length, 0, type);
    assert.deepEqual(matchNetworks({ parsed, networks: [network], fetchEvidence, homepage: { html } }).inconclusiveNetworkIds, [network.id]);
  }
});

test('plain data, unknown types, incomplete tags and resource hints remain insufficient', () => {
  for (const type of ['application/json','application/ld+json','importmap','speculationrules','text/template',
    'text/plain','text/html','text/x-lazy-cache','custom/javascript','module;not-a-module',
    'bad-text/javascript','1234-text/javascript','38dea565cbb8e5075013007e-application/json',
    'lazy','litespeed/javascript;example=true','javascript/blocked','application/consent','starcache/delay']) {
    const html = `<script type="${type}" data-src="${url}">{"adsbygoogle":"${id}"}</script>`;
    assert.equal(matches(html).length, 0, type);
  }
  for (const type of ['application/json','application/ld+json','text/template']) {
    assert.equal(matches(`<script type="${type}" data-category="marketing" data-rocket-src="${url}"></script>`).length, 0);
  }
  for (const attrs of ['data-note="example"','data-cookieconsent=""','data-cookiescript="rejected"']) {
    assert.equal(matches(`<script type="text/plain" ${attrs} data-src="${url}"></script>`).length, 0);
  }
  for (const html of [`<link rel="preload" as="script" href="${url}">`, `<p>${url}</p>`,
    `<script type="litespeed/javascript" data-src="${url}">`, `<svg><script href="${url}"></script></svg>`]) {
    assert.equal(matches(html).length, 0);
  }
});

test('CMP metadata, vendor catalogs, disabled settings and examples cannot confirm either network', () => {
  for (const target of [network, taboola]) {
    const source = target === network ? url : 'https://cdn.taboola.com/libtrc/example/loader.js';
    for (const attrs of ['data-cmp-vendors="catalog"', 'data-service="ad-settings"',
      'data-cmp-vendor="755"', 'data-category="vendors"', 'data-cookieyes="cookieyes-advertisement"']) {
      for (const body of [JSON.stringify({ enabled:false, adsbygoogle:id, url:source }), `window.disabledSettings = {url:'${source}', adsbygoogle:'${id}'};`]) {
        assert.equal(matches(`<script type="text/plain" ${attrs}>${body}</script>`, target).length, 0, attrs);
      }
    }
    for (const attrs of ['data-cookieconsent="marketing"', 'data-category="marketing"', 'class="optanon-category-C0004"']) {
      for (const body of [JSON.stringify({adsbygoogle:id, url:source}), JSON.stringify([{url:source}]),
        `'${source} adsbygoogle ${id}';`, `// adsbygoogle ${source} ${id}\n`, `/* adsbygoogle ${source} ${id} */`]) {
        assert.equal(matches(`<script type="text/plain" ${attrs}>${body}</script>`, target).length, 0, attrs + body);
      }
    }
  }
});

test('only exact activation attributes and executable inline payload supply signals', () => {
  const other = url.replace(id, id.slice(0, -1) + '4'); // Exactly one digit differs.
  assert.equal(matches(`<script type="litespeed/javascript" data-src="${other}" data-original-src="${url}"></script>`).length, 0);
  for (const target of [network, taboola]) {
    const source = target === network ? url : 'https://cdn.taboola.com/libtrc/example/loader.js';
    for (const attrs of [`src="/ad-block-detector.js" data-check-url="${source}"`,
      `src="/safe.js" data-ad-client="${id}" data-description="adsbygoogle ${source}"`,
      `type="litespeed/javascript" data-src="/safe.js" data-original-src="${source}"`,
      `type="rocketlazyloadscript" data-src="${source}"`,
      `type="text/plain" data-cookieconsent="marketing" data-src="${source}"`,
      `type="text/plain" data-category="marketing" data-lazy-src="${source}"`]) {
      assert.equal(matches(`<script ${attrs}></script>`, target).length, 0, attrs);
    }
    for (const type of ['', 'litespeed/javascript', 'text/plain']) {
      const attrs = `type="${type}" data-cookieconsent="marketing"`;
      for (const body of [`/* adsbygoogle ${id} ${source} */ window.loaded=true;`,
        `// adsbygoogle ${id} ${source}\nwindow.loaded=true;`]) {
        assert.equal(matches(`<script ${attrs}>${body}</script>`, target).length, 0);
      }
      assert.equal(matches(`<script ${attrs} src="/safe.js">adsbygoogle.push({client:'${id}',url:'${source}'});</script>`, target).length, 0);
      assert.equal(matches(`<script ${attrs}>window.loadAd('${source}');</script>`, target).length, type === '' ? 1 : 0, type);
    }
  }
});

test('unused meta and slot attributes cannot supply another AdSense account', () => {
  const other = id.slice(0, -1) + '4';
  assert.equal(matches(`<meta name="google-adsense-account" content="${other}" data-note="${id}">`).length, 0);
  assert.equal(matches(`<ins class="adsbygoogle" data-ad-client="${other}" data-note="${id}"></ins>`).length, 0);
});

const taboolaUrl = 'https://cdn.taboola.com/libtrc/publisher/loader.js';
async function verify(html, networks = [network, taboola]) {
  return verifyPublisher({ normalized_domain: 'publisher.example', discovery_sources: [] }, networks, {
    fetchAdsTxt: async () => ({ ...fetchEvidence, text: 'google.com,pub-1639051418715853,DIRECT\ntaboola.com,123,DIRECT' }),
    fetchHomepage: async () => ({ html, finalUrl: 'https://publisher.example/' }),
  });
}
for (const [name, body] of [
  ['unused URL variable', source => `const disabledUrl = "${source}";`],
  ['literal URL followed by unrelated code', source => `"${source}"; window.unrelated = true;`],
  ['unreachable loader call', source => `if (false) window.loadAd("${source}");`],
]) test(`held inline ${name} is inconclusive, never a confirmation or miss`, async () => {
  for (const target of [network, taboola]) {
    const source = target === network ? url : taboolaUrl;
    for (const attrs of ['type="text/plain" data-category="marketing"', 'type="litespeed/javascript"']) {
      const result = await verify(`<script ${attrs}>${body(source)}</script>`);
      assert.equal(result.matches.confirmed.length, 0);
      assert.notEqual(result.outcome, 'no_match');
      assert.deepEqual(result.inconclusiveNetworkIds, [target.id]);
      assert.equal(correctionConfirmation({ ad_network_id: target.id }, result), 'live_check_inconclusive');
    }
  }
});

test('a held exact AdSense ID needs no marker to be inconclusive', async () => {
  const result = await verify(`<script type="text/plain" data-category="marketing">const unused = "${id}";</script>`);
  assert.deepEqual(result.inconclusiveNetworkIds, [network.id]);
  assert.equal(result.matches.confirmed.length, 0);
});

test('Complianz activates data-cmplz-src, never plain src', async () => {
  for (const target of [network, taboola]) {
    const source = target === network ? url : taboolaUrl;
    const attrs = 'type="text/plain" data-category="marketing"';
    assert.equal(matches(`<script ${attrs} src="${source}"></script>`, target).length, 0);
    assert.equal(matches(`<script ${attrs} data-cmplz-src="${source}"></script>`, target).length, 1);
  }
});

test('saved module types parse imports, exports and top-level await before stripping comments', async () => {
  for (const attrs of [
    'type="rocketlazyloadscript" data-rocket-type="module"',
    'type="text/rocketlazyloadscript" data-rocket-type="module"',
    'type="38dea565cbb8e5075013007e-module"',
    'type="module" data-type="lazy"',
    'type="pmdelayedscript" data-perfmatters-type="module"',
    'type="PenciLazyScript" data-pencilazy-type="module"',
    'type="javascript/blocked" data-wpmeteor-type="module"',
    'type="application/consent" consent-required="755" consent-original-type-_="module"',
    'type="o/js-lzl" data-type="module"',
    'type="starcache/delay" data-starcache-type="module"',
    'type="text/plain" data-cookiecategory="advertising" data-type="module"',
    'type="text/plain" data-faz-category="marketing" data-faz-original-type="module"',
  ]) {
    const result = await verify(`<script ${attrs}>import x from '/safe.js'; /* ${taboolaUrl} */ export const account = "${id}"; await x();</script>`);
    // Parsing in classic mode would fail and preserve the comment's Taboola signal.
    assert.deepEqual(result.inconclusiveNetworkIds, [network.id], attrs);
    assert.equal(result.matches.confirmed.length, 0);
  }
});

test('inline parse failures protect exactly the networks whose signals they contain', async () => {
  for (const attrs of ['', 'type="module"', 'type="text/plain" data-category="marketing"']) {
    const result = await verify(`<script ${attrs}>window.loadAd("${taboolaUrl}", "${id}"; broken syntax</script>`);
    assert.deepEqual(result.inconclusiveNetworkIds, [network.id, taboola.id]);
    assert.notEqual(result.outcome, 'no_match');
    assert.equal(result.matches.confirmed.length, 0);
  }
});

test('ordinary executable inline matching keeps the 1.4 behavior without proving execution', async () => {
  for (const type of ['', 'text/javascript', 'module']) {
    for (const body of [
      `const unused = "${taboolaUrl}";`,
      `"${taboolaUrl}";`,
      `"${taboolaUrl}"; window.unrelated = true;`,
      `if (false) window.loadAd("${taboolaUrl}");`,
      `adsbygoogle.push({client: "${id}"});`,
    ]) {
      const result = await verify(`<script type="${type}">${body}</script>`);
      assert.equal(result.matches.confirmed.length, 1);
      assert.deepEqual(result.inconclusiveNetworkIds, []);
    }
  }
});

test('a separate activation source can confirm despite an inconclusive inline body', async () => {
  const result = await verify(`<script type="text/plain" data-category="marketing">const unused = "${taboolaUrl}";</script><script type="text/plain" data-category="marketing" data-cmplz-src="${taboolaUrl}"></script>`);
  assert.deepEqual(result.matches.confirmed.map(m => m.networkId), [taboola.id]);
  assert.deepEqual(result.inconclusiveNetworkIds, []);
});

test('correction does not treat another network uncertainty as this network uncertainty', async () => {
  const result = await verify(`<script type="text/plain" data-category="marketing">const unused = "${taboolaUrl}";</script>`);
  assert.equal(correctionConfirmation({ ad_network_id: network.id }, result), 'live_network_absent');
});


test('Perfmatters data-src only qualifies when saved LiteSpeed type activates it afterward', () => {
  assert.equal(matches(`<script type="pmdelayedscript" data-src="${url}"></script>`).length, 0);
  assert.equal(matches(`<script type="pmdelayedscript" data-perfmatters-type="litespeed/javascript" data-src="${url}"></script>`).length, 1);
  assert.equal(matches(`<script type="pmdelayedscript" src="${url}"></script>`).length, 1);
});

test('FAZ only activates script src; data-faz-src belongs to other resource types', () => {
  assert.equal(matches(`<script type="text/plain" data-faz-category="marketing" data-faz-src="${url}"></script>`).length, 0);
  assert.equal(matches(`<script type="text/plain" data-faz-category="marketing" src="${url}"></script>`).length, 1);
});


for (const fixture of fixtures.filter(item => item.savedType)) {
  test(`${fixture.name}: restored non-JavaScript types are neither ad code nor inconclusive`, async () => {
    for (const savedType of ['application/ld+json', 'application/json', 'importmap', 'text/plain', 'custom/javascript',
      'module;not-a-module', 'litespeed/javascript']) {
      // The measured Perfmatters -> LiteSpeed chain has its own positive test.
      if (fixture.name.startsWith('Perfmatters') && savedType === 'litespeed/javascript') continue;
      const attrs = { ...fixture.attrs, [fixture.savedType]: savedType };
      const restored = { ...fixture, attrs };
      for (const source of [url, taboolaUrl]) {
        const html = markup(restored, source);
        for (const candidate of [html, html.replace('></script>', `>window.loadAd("${source}");</script>`),
          html.replace(`${fixture.source}="${source}"`, '')
            .replace('></script>', `>window.loadAd("${source}");</script>`),
          html.replace('></script>', ' src="/safe.js"></script>')]) {
          const result = await verify(candidate);
          assert.equal(result.matches.confirmed.length, 0, `${savedType}: ${candidate}`);
          assert.deepEqual(result.inconclusiveNetworkIds, [], `${savedType}: ${candidate}`);
        }
      }
    }
  });
  test(`${fixture.name}: saved executable JavaScript and module types still confirm`, () => {
    // data-src is activated only by the LiteSpeed step, not by restored JS.
    const sourceFixture = fixture.name === 'Perfmatters with LiteSpeed' ? { ...fixture, source: 'src' } : fixture;
    for (const savedType of ['', 'text/javascript', 'application/javascript; charset=utf-8', 'text/javascript1.5', 'module']) {
      const restored = { ...sourceFixture, attrs: { ...fixture.attrs, [fixture.savedType]: savedType } };
      assert.equal(matches(markup(restored)).length, 1, savedType);
      assert.equal(matches(markup(restored, taboolaUrl), taboola).length, 1, savedType);
    }
  });
}

for (const fixture of fixtures.filter(item => item.source !== 'src')) {
  for (const reversed of [false, true]) for (const adFirst of [false, true]) {
    test(`${fixture.name}: conflicting sources are inconclusive (reverse=${reversed}, adFirst=${adFirst})`, async () => {
      for (const source of [url, taboolaUrl]) {
        const sources = [[fixture.source, adFirst ? source : '/safe.js'], ['src', adFirst ? '/safe.js' : source]];
        if (reversed) sources.reverse();
        const attrs = { ...fixture.attrs, ...Object.fromEntries(sources) };
        const html = markup({ ...fixture, attrs }, sources.find(([key]) => key === fixture.source)[1]);
        const result = await verify(html);
        assert.equal(result.matches.confirmed.length, 0, html);
        assert.deepEqual(result.inconclusiveNetworkIds, [source === url ? network.id : taboola.id], html);
      }
    });
  }
  test(`${fixture.name}: identical source candidates can confirm`, () => {
    const duplicate = { ...fixture, attrs: { ...fixture.attrs, src: url } };
    assert.equal(matches(markup(duplicate)).length, 1);
  });
}

test('two activation attributes with different values are inconclusive', async () => {
  const result = await verify(`<script type="rocketlazyloadscript" data-rocket-src="${taboolaUrl}" data-src="${url}"></script>`);
  assert.equal(result.matches.confirmed.length, 0);
  assert.deepEqual(result.inconclusiveNetworkIds, [network.id, taboola.id]);
});

test('an empty competing source also makes a held source inconclusive', async () => {
  const result = await verify(`<script type="litespeed/javascript" data-src="${taboolaUrl}" src=""></script>`);
  assert.equal(result.matches.confirmed.length, 0);
  assert.deepEqual(result.inconclusiveNetworkIds, [taboola.id]);
});

test('AdSense account option on a conflicting actual loader is inconclusive', async () => {
  const result = await verify(`<script type="litespeed/javascript" data-src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" src="/safe.js" data-ad-client="${id}"></script>`);
  assert.equal(result.matches.confirmed.length, 0);
  assert.deepEqual(result.inconclusiveNetworkIds, [network.id]);
});

test('a separate qualifying source still confirms a network with conflicting sources elsewhere', async () => {
  const result = await verify(`<script type="litespeed/javascript" data-src="${taboolaUrl}" src="/safe.js"></script><script src="${taboolaUrl}"></script>`);
  assert.deepEqual(result.matches.confirmed.map(item => item.networkId), [taboola.id]);
  assert.deepEqual(result.inconclusiveNetworkIds, []);
});

for (const wrapper of ['pre', 'code', 'blockquote']) {
  test(`${wrapper}: real script elements still execute and supply ordinary or held signals`, async () => {
    for (const source of [url, taboolaUrl]) {
      const target = source === url ? network : taboola;
      assert.equal(matches(`<${wrapper}><script>load("${source}");</script></${wrapper}>`, target).length, 1);
      assert.equal(matches(`<${wrapper}><script src="${source}"></script></${wrapper}>`, target).length, 1);
      assert.equal(matches(`<${wrapper}><script type="litespeed/javascript" data-src="${source}"></script></${wrapper}>`, target).length, 1);
      const result = await verify(`<${wrapper}><script type="litespeed/javascript">load("${source}");</script></${wrapper}>`);
      assert.deepEqual(result.inconclusiveNetworkIds, [target.id]);
    }
  });
}


for (const fixture of fixtures) {
  test(`${fixture.name}: two distinct known source attributes cannot confirm`, async () => {
    const secondSource = fixture.source === 'data-src' ? 'data-rocket-src' : 'data-src';
    const conflicting = { ...fixture, attrs: { ...fixture.attrs, [secondSource]: '/safe.js' } };
    const result = await verify(markup(conflicting, taboolaUrl));
    // Autoptimize is ordinary executable JS: only its actual src is a candidate.
    assert.deepEqual(result.matches.confirmed.map(item => item.networkId), fixture.name === 'Autoptimize defer' ? [taboola.id] : []);
    assert.deepEqual(result.inconclusiveNetworkIds, fixture.name === 'Autoptimize defer' ? [] : [taboola.id]);
  });
}
