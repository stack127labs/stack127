import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function readBuildSha() {
  const environmentSha = process.env.VERSION127_BUILD_SHA ?? process.env.GIT_COMMIT_SHA;
  return environmentSha || "unknown";
}

export async function GET() {
  // Keep the container health check independent of the `pg` module. The
  // release workflow separately validates the production database before
  // building, while public smoke paths verify that pages can render.
  const databaseOk = Boolean(process.env.DATABASE_URL);
  const databaseError = databaseOk ? null : "DATABASE_URL is not configured";
  return NextResponse.json(
    {
      ok: databaseOk,
      status: databaseOk ? "healthy" : "unhealthy",
      scope: "deploy",
      build: { sha: readBuildSha() },
      checks: { database: { ok: databaseOk, error: databaseError } },
    },
    {
      status: databaseOk ? 200 : 503,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
