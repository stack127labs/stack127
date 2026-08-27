import assert from "node:assert/strict";
import test from "node:test";
import { docFolderForRoute, routeFromPageFile } from "../../scripts/stack127/quality/route-utils.mjs";

test("routeFromPageFile maps app site page files to public routes", () => {
  assert.equal(routeFromPageFile("app/(site)/page.tsx"), "/");
  assert.equal(routeFromPageFile("app/(site)/(legal)/about/page.tsx"), "/about");
  assert.equal(routeFromPageFile("app/(site)/(tools)/dns-lookup/page.tsx"), "/dns-lookup");
  assert.equal(
    routeFromPageFile("app/(site)/(courses)/self-hosting-for-beginners/linux-ssh-basics/page.tsx"),
    "/self-hosting-for-beginners/linux-ssh-basics",
  );
  assert.equal(routeFromPageFile("app/(site)/(catalogs)/self-host-apps/page.tsx"), "/self-host-apps");
  assert.equal(
    routeFromPageFile("app/(site)/(catalogs)/software-licenses-for-self-hosting/page.tsx"),
    "/software-licenses-for-self-hosting",
  );
  assert.equal(routeFromPageFile("app/(site)/(legal)/privacy/page.tsx"), "/privacy");
});

test("docFolderForRoute maps routes to required content_docs folders", () => {
  assert.equal(docFolderForRoute("/"), "home");
  assert.equal(docFolderForRoute("/privacy"), "privacy");
  assert.equal(docFolderForRoute("/self-hosting-for-beginners/linux-ssh-basics"), "self-hosting-for-beginners");
});
