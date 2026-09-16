import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../../", import.meta.url);

function read(relativePath) {
  return readFileSync(new URL(relativePath, root), "utf8");
}

test("the course's concept visuals keep their teaching claims aligned", () => {
  const dockerSpec = JSON.parse(
    read("app/(site)/(courses)/self-hosting-for-beginners/install-docker/art/image-container-port.spec.json"),
  );
  assert.match(dockerSpec.takeaway, /host port mapped to the app's port/);
  assert.match(
    read("app/(site)/(courses)/self-hosting-for-beginners/install-docker/page.tsx"),
    /imageContainerCycleArt/,
  );

  const keySpec = JSON.parse(
    read("app/(site)/(courses)/self-hosting-for-beginners/linux-ssh-basics/art/ssh-key-path.spec.json"),
  );
  assert.equal(keySpec.type, "steps");
  assert.match(
    read("app/(site)/(courses)/self-hosting-for-beginners/linux-ssh-basics/page.tsx"),
    /sshKeyPathArt/,
  );

  const roadmapSpec = JSON.parse(
    read("app/(site)/(courses)/self-hosting-for-beginners/full-walkthrough/art/full-loop.spec.json"),
  );
  assert.deepEqual(
    roadmapSpec.data.groups.map((group) => group.label),
    ["machine", "os + ssh", "app", "data", "backup", "remote"],
  );

  for (const generatedPath of [
    "app/(site)/(courses)/self-hosting-for-beginners/install-docker/art/image-container-cycle.svg",
    "app/(site)/(courses)/self-hosting-for-beginners/install-docker/art/image-container-cycle.ts",
    "app/(site)/(courses)/self-hosting-for-beginners/linux-ssh-basics/art/ssh-key-path.svg",
    "app/(site)/(courses)/self-hosting-for-beginners/linux-ssh-basics/art/ssh-key-path.ts",
  ]) {
    assert.equal(existsSync(new URL(generatedPath, root)), true, generatedPath);
  }
});
