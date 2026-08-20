#!/usr/bin/env node

import { canonicalUrl } from "../lib/candidates.mjs";
import { withClient } from "../lib/db.mjs";
import { mapConcurrent } from "../lib/http.mjs";

const concurrency = Number(process.env.RESOLVER_CONCURRENCY ?? 6);

function relayUrl(value) {
  const url = new URL(value);
  const host = url.hostname.replace(/\./g, "-");
  return `https://${host}.translate.goog${url.pathname}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en`;
}

function repositoryFromMetadataUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);

    if (host === "api.github.com" && parts[0] === "repos" && parts.length >= 3) {
      return `https://github.com/${parts[1]}/${parts[2]}`;
    }
    if (host === "github.com" && parts.length >= 2) {
      return `https://github.com/${parts[0]}/${parts[1].replace(/\.git$/i, "")}`;
    }
    if (host === "gitlab.com" && parts.length >= 2) {
      const separator = parts.indexOf("-");
      const repositoryParts = separator >= 2 ? parts.slice(0, separator) : parts.slice(0, 2);
      return `https://gitlab.com/${repositoryParts.join("/")}`;
    }
    if (host === "codeberg.org" && parts.length >= 2) {
      return `https://codeberg.org/${parts[0]}/${parts[1].replace(/\.git$/i, "")}`;
    }

    return value;
  } catch {
    return null;
  }
}

function metadataUrlFromMarkdown(content) {
  const markdownMatch = content.match(/\[extracted from README\]\((https?:\/\/[^)]+)\)/i);
  if (markdownMatch?.[1]) return markdownMatch[1];

  const htmlMatch = content.match(/<a href="([^"]+)"[^>]*>extracted from README<\/a>/i);
  if (!htmlMatch?.[1]) return null;
  const href = htmlMatch[1].replace(/&amp;/g, "&");

  try {
    const url = new URL(href);
    return url.hostname === "translate.google.com" ? url.searchParams.get("u") : href;
  } catch {
    return null;
  }
}

function sourceCodeHost(value) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    if (host === "github.com") return "github";
    if (host === "gitlab.com") return "gitlab";
    if (host === "codeberg.org") return "codeberg";
    return "other";
  } catch {
    return "unknown";
  }
}

async function fetchMarkdown(url) {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(relayUrl(url), {
        headers: { Accept: "text/markdown", "User-Agent": "stack127-candidate-identity-review/1.0" },
        signal: AbortSignal.timeout(45000),
      });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.retryAfter = Number(response.headers.get("retry-after")) || null;
        throw error;
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 5) {
        const retryAfterMs = error.retryAfter ? error.retryAfter * 1000 : 0;
        const backoffMs = Math.max(retryAfterMs, Math.min(30000, 3000 * (2 ** (attempt - 1))));
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }
  throw lastError;
}

await withClient(async (client) => {
  const result = await client.query(
    `
      select id, name, source_url
      from public.open_project_candidates
      where source = 'selfhostedworld'
        and status = 'needs_review'
        and source_code_url is null
      order by name, id
    `,
  );
  const counts = { checked: 0, resolved: 0, missing: 0, errors: 0 };
  let queryQueue = Promise.resolve();
  const serialQuery = (...queryArgs) => {
    const next = queryQueue.then(() => client.query(...queryArgs));
    queryQueue = next.catch(() => undefined);
    return next;
  };

  await mapConcurrent(result.rows, concurrency, async (candidate) => {
    try {
      const markdown = await fetchMarkdown(candidate.source_url);
      const metadataUrl = metadataUrlFromMarkdown(markdown);
      const sourceCodeUrl = repositoryFromMetadataUrl(metadataUrl);

      if (!sourceCodeUrl) {
        counts.missing += 1;
        await serialQuery(
          `
            update public.open_project_candidates
            set payload = payload || jsonb_build_object(
                  'identity_review', jsonb_build_object(
                    'fetched_via', $2::text,
                    'result', 'metadata_source_missing'
                  )
                ),
                updated_at = now()
            where id = $1
          `,
          [candidate.id, relayUrl(candidate.source_url)],
        );
      } else {
        counts.resolved += 1;
        await serialQuery(
          `
            update public.open_project_candidates
            set source_code_url = $2,
                source_code_host = $3,
                canonical_source_code_key = $4,
                payload = payload || jsonb_build_object(
                  'identity_review', jsonb_build_object(
                    'fetched_via', $5::text,
                    'metadata_url', $6::text,
                    'source_code_url', $2::text
                  )
                ),
                status = 'new',
                updated_at = now()
            where id = $1
          `,
          [
            candidate.id,
            sourceCodeUrl,
            sourceCodeHost(sourceCodeUrl),
            canonicalUrl(sourceCodeUrl),
            relayUrl(candidate.source_url),
            metadataUrl,
          ],
        );
      }
    } catch (error) {
      counts.errors += 1;
      await serialQuery(
        `
          update public.open_project_candidates
          set payload = payload || jsonb_build_object(
                'identity_review', jsonb_build_object(
                  'fetched_via', $2::text,
                  'result', 'fetch_error',
                  'error', $3::text
                )
              ),
              updated_at = now()
          where id = $1
        `,
        [candidate.id, relayUrl(candidate.source_url), String(error.message ?? error)],
      );
    } finally {
      counts.checked += 1;
      if (counts.checked % 100 === 0 || counts.checked === result.rows.length) {
        console.log(JSON.stringify({ ...counts, total: result.rows.length }));
      }
    }
  });

  console.log(JSON.stringify({ ...counts, total: result.rows.length }, null, 2));
});
