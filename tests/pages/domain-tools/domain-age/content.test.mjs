import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL(
  "../../../../app/(site)/domain-tools/domain-age/page.tsx",
  import.meta.url,
);

test("domain age checker keeps the approved plain-language explanation", async () => {
  const page = await readFile(pageUrl, "utf8");

  assert.match(page, /Domain <mark>age<\/mark> checker: how old is a domain\?/);
  assert.match(page, /What is a domain age checker\?/);
  assert.match(page, /Why would you check a domain’s age\?/);
  assert.match(page, /What does domain age actually mean\?/);
  assert.match(page, /What happens if a domain expires\?/);
  assert.match(page, /What does the result show\?/);
  assert.match(page, /Does an old domain mean a website is trustworthy\?/);
  assert.match(page, /Domain age is most useful as a contradiction detector\./);
  assert.match(
    page,
    /A new domain by itself is not proof\s+that anything is wrong\./,
  );
});

test("domain age results do not overstate RDAP events", async () => {
  const tool = await readFile(
    new URL(
      "../../../../app/(site)/domain-tools/domain-age/domain-age-tool.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(tool, /registered subsequently to its initial registration/);
  assert.match(
    tool,
    /does not say why the domain was registered\s+again/,
  );
  assert.match(
    tool,
    /does not identify what changed, why it changed/,
  );
  assert.doesNotMatch(tool, /The name was dropped at some point/);
  assert.doesNotMatch(tool, /edited yesterday/);
});
