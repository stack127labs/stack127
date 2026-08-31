#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

export const reviewedSlugs = [
  "8mb-local",
  "92five",
  "affine-community-edition",
  "airbyte",
  "akaunting",
  "arize-phoenix",
  "autogpt",
  "billabear",
  "bionicgpt",
  "bookwyrm",
  "budibase",
  "bugsink",
  "cachet",
  "cert-warden",
  "chaskiq",
  "cially",
  "cloud-seeder",
  "cloudpanel",
  "codezero",
  "convex",
  "convoy",
  "craft-cms",
  "cubiks-2048",
  "dify",
  "dockhand",
  "docking-station",
  "duplicacy",
  "edit-mind",
  "eigenfocus",
  "emqx",
  "erxes",
  "eventschedule",
  "fizzy",
  "flow-like",
  "forward-email",
  "foundry-virtual-tabletop",
  "gamevault",
  "geopulse",
  "graylog",
  "guardian-plex",
  "honey",
  "hoodik",
  "hook0",
  "investbrain",
  "invoice-ninja",
  "jellyfin-rewind",
  "journiv",
  "keygen",
  "kirby",
  "kortix",
  "lobehub",
  "luna",
  "m3u-editor",
  "marble",
  "monetr",
  "multica",
  "n8n",
  "nango",
  "nocodb",
  "novus-mail",
  "nullboard",
  "obskurnee",
  "october",
  "omoide",
  "open-webui",
  "openpanel",
  "origamivault",
  "outline",
  "oxid-eshop",
  "pagecord",
  "pasta",
  "photostructure",
  "pixelfin",
  "planka",
  "private-captcha",
  "ptah-sh",
  "rejourney",
  "replex",
  "rudderstack",
  "sayr",
  "scrypted",
  "sentry-self-hosted",
  "sessy",
  "sharetribe",
  "single-file-php-gallery",
  "spacepad",
  "sparkyfitness",
  "sprout-track",
  "statamic",
  "statusscout",
  "tasktrove",
  "tdarr",
  "umbrelos",
  "unraid-guardian",
  "viniplay",
  "werbot",
  "woli-webgui",
  "workout-challenge",
];

export const freemiumSlugs = new Set([
  "affine-community-edition",
  "airbyte",
  "akaunting",
  "budibase",
  "cert-warden",
  "convoy",
  "craft-cms",
  "dify",
  "dockhand",
  "duplicacy",
  "emqx",
  "erxes",
  "gamevault",
  "graylog",
  "invoice-ninja",
  "n8n",
  "nango",
  "nocodb",
  "october",
  "open-webui",
  "openpanel",
  "outline",
  "oxid-eshop",
  "photostructure",
  "planka",
  "private-captcha",
  "rudderstack",
  "sayr",
  "scrypted",
  "single-file-php-gallery",
  "statamic",
  "tasktrove",
  "tdarr",
]);

export const paidSlugs = new Set(["foundry-virtual-tabletop", "kirby"]);

const pricingSourceOverrides = {
  "affine-community-edition": "https://affine.pro/pricing",
  airbyte: "https://airbyte.com/pricing",
  budibase: "https://budibase.com/pricing",
  "craft-cms": "https://craftcms.com/pricing",
  dify: "https://dify.ai/pricing",
  dockhand: "https://dockhand.pro/pricing",
  duplicacy: "https://duplicacy.com/buy.html",
  "foundry-virtual-tabletop": "https://foundryvtt.com/purchase/",
  graylog: "https://graylog.org/pricing/",
  kirby: "https://getkirby.com/buy",
  n8n: "https://n8n.io/pricing/",
  nocodb: "https://nocodb.com/pricing",
  openpanel: "https://openpanel.com/pricing/",
  photostructure: "https://photostructure.com/pricing/",
  planka: "https://planka.app/pricing",
  "private-captcha": "https://privatecaptcha.com/pricing/",
  "single-file-php-gallery": "https://sye.dk/sfpg/",
  statamic: "https://statamic.com/pricing",
  tasktrove: "https://tasktrove.io/pricing",
};

export function pricingModelFor(slug) {
  if (paidSlugs.has(slug)) return "paid";
  if (freemiumSlugs.has(slug)) return "freemium";
  return "free";
}

function pricingNote(row, pricingModel) {
  if (pricingModel === "paid") {
    return `Official publisher materials require a paid software license for self-hosted use. The reviewed ${row.license} terms still apply, and infrastructure may cost extra.`;
  }
  if (pricingModel === "freemium") {
    return `Official project materials document a no-fee self-hosted edition or permitted use alongside paid software features, editions, or commercial terms. The reviewed ${row.license} restrictions still apply, and infrastructure may cost extra.`;
  }
  return `Official project materials document self-hosting without a published software license fee. The reviewed ${row.license} restrictions still apply, and hosting or third-party services may cost extra.`;
}

function compareReviewedRows(rows) {
  const expected = [...reviewedSlugs].sort();
  const actual = rows.map((row) => row.slug).sort();
  const missing = expected.filter((slug) => !actual.includes(slug));
  const unexpected = actual.filter((slug) => !expected.includes(slug));
  if (missing.length || unexpected.length) {
    throw new Error(`Pricing review set changed. Missing: ${missing.join(", ") || "none"}. Unexpected: ${unexpected.join(", ") || "none"}.`);
  }
}

export async function applySourceAvailablePricing({ dryRun, databaseUrl }) {
  return withClient(async (client) => {
    await client.query("begin");
    try {
      const result = await client.query(
        `
          select id, slug, website_url, source_code_url, license
          from public.self_host_apps
          where published = true
            and self_hosting_status = 'self_hostable'
            and source_model = 'source_available'
            and pricing_model = 'unknown'
          order by slug
          for update
        `,
      );
      compareReviewedRows(result.rows);

      const counts = { free: 0, freemium: 0, paid: 0 };
      for (const row of result.rows) {
        const pricingModel = pricingModelFor(row.slug);
        const sourceUrl = pricingSourceOverrides[row.slug] ?? row.website_url ?? row.source_code_url;
        if (!sourceUrl?.startsWith("https://")) throw new Error(`Missing official HTTPS pricing source for ${row.slug}`);

        const updated = await client.query(
          `
            update public.self_host_apps
            set pricing_model = $2, updated_at = now()
            where id = $1 and pricing_model = 'unknown'
          `,
          [row.id, pricingModel],
        );
        if (updated.rowCount !== 1) throw new Error(`Pricing row changed while reviewing ${row.slug}`);

        await client.query(
          `
            insert into public.self_host_app_field_sources (
              app_id, field_name, source, source_url, confidence, checked_at, note
            ) values ($1, 'pricing_model', 'reviewed_source_available_pricing', $2, 'high', now(), $3)
            on conflict (app_id, field_name) do update set
              source = excluded.source,
              source_url = excluded.source_url,
              confidence = excluded.confidence,
              checked_at = excluded.checked_at,
              note = excluded.note
          `,
          [row.id, sourceUrl, pricingNote(row, pricingModel)],
        );
        counts[pricingModel] += 1;
      }

      if (dryRun) await client.query("rollback");
      else await client.query("commit");
      return { dry_run: dryRun, reviewed: result.rowCount, counts };
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }, databaseUrl);
}

async function main() {
  const args = parseArgs();
  const report = await applySourceAvailablePricing({
    dryRun: Boolean(args["dry-run"]),
    databaseUrl: args["database-url"],
  });
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.stack ?? error.message);
    process.exit(1);
  });
}
