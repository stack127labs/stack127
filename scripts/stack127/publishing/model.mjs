export const REGISTRY_FIELDS = Object.freeze([
  "label", "meta_title", "meta_description", "is_published", "cover_image_url",
  "page_type", "sitemap_priority", "is_indexable",
]);

export const CONTENT_FIELDS = Object.freeze({
  tool: Object.freeze([
    "title", "intro_markdown", "usage_markdown", "content_markdown", "tool_version",
    "stack127_repo_url", "stack127_repo_version", "stack127_repo_commit_sha",
    "card_name", "card_description", "card_icon_key", "card_art_key",
  ]),
  directory: Object.freeze([
    "title", "intro_markdown", "content_markdown", "card_name", "card_description",
    "card_icon_key", "card_art_key",
  ]),
  course: Object.freeze([
    "title", "intro_markdown", "content_markdown", "card_name", "card_description",
    "card_icon_key", "card_art_key", "author_name", "author_avatar_url", "navigation_label",
  ]),
  catalog: Object.freeze([
    "title", "intro_markdown", "content_markdown", "card_name", "card_description",
    "card_icon_key", "card_art_key", "display_order",
  ]),
});

function exactFields(value, fields, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  for (const field of Object.keys(value)) {
    if (!fields.includes(field)) throw new Error(`Unknown ${name} field: ${field}`);
  }
  for (const field of fields) {
    if (!Object.hasOwn(value, field)) throw new Error(`Missing ${name} field: ${field}`);
  }
}

export function validateRef(ref) {
  exactFields(ref, ["slug", "family"], "page reference");
  if (!Object.hasOwn(CONTENT_FIELDS, ref.family)) throw new Error(`Unsupported page family: ${ref.family}`);
  if (typeof ref.slug !== "string" || ref.slug.length > 240
    || !/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(ref.slug)) {
    throw new Error(`Invalid page slug: ${ref.slug}`);
  }
  if (!["directory", "course"].includes(ref.family) && ref.slug.includes("/")) {
    throw new Error(`${ref.family} pages must use a root slug: ${ref.slug}`);
  }
  return { slug: ref.slug, family: ref.family };
}

function textField(value, name, { nullable = false, empty = false, trimmed = true } = {}) {
  if (nullable && value === null) return null;
  if (typeof value !== "string" || (trimmed && value !== value.trim()) || (!empty && !value.trim().length)) {
    throw new Error(`${name} must be ${nullable ? "null or " : ""}${trimmed ? "trimmed " : ""}${empty ? "text" : "nonempty text"}`);
  }
  return value;
}

function integer(value, name, positive = false) {
  if (!Number.isInteger(value) || value < (positive ? 1 : -2147483648) || value > 2147483647) {
    throw new Error(`${name} must be ${positive ? "a positive" : "an"} integer within PostgreSQL's integer range`);
  }
  return value;
}

// A missing family row is a valid snapshot of an unfinished registry draft.
export function validateState(state, family = state?.family) {
  if (!Object.hasOwn(CONTENT_FIELDS, family)) throw new Error(`Unsupported page family: ${family}`);
  exactFields(state, ["slug", "family", "registry", "content", ...(family === "tool" ? ["catalogs"] : []), ...(family === "course" ? ["lesson"] : [])], "state");
  const ref = validateRef({ slug: state.slug, family: state.family });
  if (state.family !== family) throw new Error(`Wrong page family for ${state.slug}: expected ${family}`);
  exactFields(state.registry, REGISTRY_FIELDS, "registry");
  const registry = {};
  for (const field of REGISTRY_FIELDS) {
    const value = state.registry[field];
    if (field === "is_published" || field === "is_indexable") {
      if (typeof value !== "boolean") throw new Error(`registry.${field} must be a boolean`);
      registry[field] = value;
    } else if (field === "sitemap_priority") {
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1
        || Math.abs(value * 100 - Math.round(value * 100)) > 1e-8) {
        throw new Error("registry.sitemap_priority must be a number from 0 to 1 with at most two decimal places");
      }
      registry[field] = value;
    } else {
      registry[field] = textField(value, `registry.${field}`, { nullable: field === "cover_image_url" });
    }
  }

  let content = null;
  if (state.content !== null) {
    if (family === "directory" && typeof state.content === "object" && !Array.isArray(state.content)) {
      for (const field of ["card_icon_key", "card_art_key"]) {
        if (!Object.hasOwn(state.content, field)) {
          throw new Error(`Missing directory content field: ${field}. Regenerate the plan with the current publisher to preserve directory card assets.`);
        }
      }
    }
    exactFields(state.content, CONTENT_FIELDS[family], `${family} content`);
    content = {};
    for (const field of CONTENT_FIELDS[family]) {
      content[field] = field === "display_order"
        ? integer(state.content[field], `content.${field}`)
        : textField(state.content[field], `content.${field}`, {
          nullable: field.startsWith("stack127_repo_") || field === "usage_markdown"
            || (family !== "tool" && field === "content_markdown")
            || (["directory", "course"].includes(family) && ["card_icon_key", "card_art_key"].includes(field)),
          trimmed: !(family === "tool" && ["card_name", "card_description"].includes(field)),
        });
      if (field.endsWith("_key") && content[field] !== null && !/^[a-z0-9-]+$/.test(content[field])) {
        throw new Error(`content.${field} must use lowercase letters, numbers, and hyphens`);
      }
    }
    if (family === "tool") {
      if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(content.tool_version)) {
        throw new Error("content.tool_version must be a semantic version");
      }
      if (content.stack127_repo_url !== null
        && !/^https:\/\/github\.com\/stack127labs\/[A-Za-z0-9._-]+\/?$/.test(content.stack127_repo_url)) {
        throw new Error("content.stack127_repo_url must identify a stack127labs GitHub repository");
      }
      if (content.stack127_repo_url === null
        && (content.stack127_repo_version !== null || content.stack127_repo_commit_sha !== null)) {
        throw new Error("Repository version and commit require content.stack127_repo_url");
      }
      if (content.stack127_repo_commit_sha !== null
        && !/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(content.stack127_repo_commit_sha)) {
        throw new Error("content.stack127_repo_commit_sha must be a full lowercase commit SHA");
      }
    }
  }

  if (family === "course" && ref.slug.includes("/") && content !== null) throw new Error("Course child pages use lesson content only");
  const result = { ...ref, registry, content };
  if (family === "course") result.lesson = validateLesson(state.lesson, ref.slug);
  if (family === "tool") {
    if (!Array.isArray(state.catalogs)) throw new Error("state.catalogs must be an array");
    const slugs = new Set();
    result.catalogs = state.catalogs.map(catalog => {
      exactFields(catalog, ["slug", "display_order"], "catalog membership");
      validateRef({ slug: catalog.slug, family: "catalog" });
      if (slugs.has(catalog.slug)) throw new Error(`Duplicate catalog membership: ${catalog.slug}`);
      slugs.add(catalog.slug);
      return { slug: catalog.slug, display_order: integer(catalog.display_order, "catalog.display_order", true) };
    });
    if (content === null && result.catalogs.length) throw new Error("A tool without content cannot have catalog memberships");
  }
  return result;
}

export function validateTouch(touch, family) {
  if (touch === undefined) return undefined;
  if (family !== 'directory') throw new Error('Only directory records use an explicit page touch');
  exactFields(touch,['reason','expected_updated_at'],'page touch');
  textField(touch.reason,'touch.reason');
  if (touch.expected_updated_at !== null && (typeof touch.expected_updated_at !== 'string'
    || !Number.isFinite(Date.parse(touch.expected_updated_at)))) throw new Error('Invalid expected page date');
  return {...touch};
}

export function desiredStates(entries, { restore = false } = {}) {
  if (!Array.isArray(entries)) throw new Error("Batch entries must be an array");
  if (typeof restore !== "boolean") throw new Error("restore must be a boolean");
  const seen = new Set();
  const pages = entries.map(entry => {
    const ref = validateRef({ slug: entry?.slug, family: entry?.family });
    validateTouch(entry.touch,ref.family);
    if (seen.has(ref.slug)) throw new Error(`Duplicate batch page: ${ref.slug}`);
    seen.add(ref.slug);
    const before = entry.before === null ? null : validateState(entry.before, ref.family);
    const after = validateState(entry.after, ref.family);
    if ((before && before.slug !== ref.slug) || after.slug !== ref.slug) {
      throw new Error(`State slug does not match batch entry: ${ref.slug}`);
    }
    if (!hasRequiredContent(after)) throw new Error(`Desired ${ref.family} content is missing for ${ref.slug}`);
    return { ...ref, before, after };
  });
  const removedCatalogs = new Set(restore ? pages.filter(page => page.family === "catalog"
    && page.before?.content === null).map(page => page.slug) : []);
  return pages.map(page => {
    if (!restore) return page.after;
    if (page.before !== null) return page.before;
    // Keep new tools as drafts without links to catalog content removed by this restore.
    return validateState({ ...page.after, registry: { ...page.after.registry, is_published: false },
      ...(page.family === "tool" ? {
        catalogs: page.after.catalogs.filter(catalog => !removedCatalogs.has(catalog.slug)),
      } : {}),
    });
  });
}

export const LESSON_FIELDS = Object.freeze(["course_slug", "title", "sidebar_label", "display_order"]);
export function validateLesson(lesson, slug) {
  if (lesson === null) return null;
  exactFields(lesson, LESSON_FIELDS, "lesson");
  validateRef({ slug: lesson.course_slug, family: "course" });
  if (lesson.course_slug.includes("/") || !(slug === lesson.course_slug || slug.startsWith(lesson.course_slug + "/"))) {
    throw new Error("Lesson slug must belong to its root course");
  }
  return { course_slug: lesson.course_slug, title: textField(lesson.title, "lesson.title"),
    sidebar_label: textField(lesson.sidebar_label, "lesson.sidebar_label"),
    display_order: integer(lesson.display_order, "lesson.display_order", true) };
}
export function hasRequiredContent(state) {
  return state.family === "course" ? Boolean(state.lesson && (state.slug.includes("/") || state.content)) : state.content !== null;
}
