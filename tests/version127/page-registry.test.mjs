import assert from "node:assert/strict";
import test from "node:test";
import {
  isHomeFeaturePage,
  isMainPageSlug,
} from "../../lib/page-registry-helpers.ts";

test("isMainPageSlug accepts only published root pages", () => {
  assert.equal(isMainPageSlug(""), false);
  assert.equal(isMainPageSlug("self-host-apps"), true);
  assert.equal(isMainPageSlug("software-licenses-for-self-hosting"), true);
  assert.equal(isMainPageSlug("self-hosting-for-beginners"), true);
  assert.equal(isMainPageSlug("self-hosting-for-beginners/install-docker"), false);
  assert.equal(isMainPageSlug("about"), true);
});

test("isHomeFeaturePage excludes legal and about utility pages", () => {
  assert.equal(
    isHomeFeaturePage({ slug: "self-host-apps", page_type: "CollectionPage" }),
    true,
  );
  assert.equal(
    isHomeFeaturePage({ slug: "software-licenses-for-self-hosting", page_type: "WebPage" }),
    true,
  );
  assert.equal(
    isHomeFeaturePage({ slug: "self-hosting-for-beginners", page_type: "Course" }),
    true,
  );
  assert.equal(
    isHomeFeaturePage({ slug: "about", page_type: "AboutPage" }),
    false,
  );
  assert.equal(
    isHomeFeaturePage({ slug: "privacy", page_type: "PrivacyPolicy" }),
    false,
  );
  assert.equal(
    isHomeFeaturePage({ slug: "terms", page_type: "TermsOfService" }),
    false,
  );
  assert.equal(
    isHomeFeaturePage({
      slug: "self-hosting-for-beginners/install-docker",
      page_type: "LearningResource",
    }),
    false,
  );
});
