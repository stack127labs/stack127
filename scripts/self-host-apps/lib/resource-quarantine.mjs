export const generatedBases = {
  ram: "deployment-shape-v1: database services, retained-data profile, and deployment shape",
  storage: "deployment-shape-v1: persistent-storage and database signals",
};

export function generatedEstimatePlan(snapshot) {
  if (snapshot.schema_version !== 2 || !Array.isArray(snapshot.records)) throw new Error("A complete version-2 audit snapshot is required");
  const plan = [];
  const seen = new Set();
  for (const entry of snapshot.records) {
    if (entry.directory !== "self-host-apps") continue;
    const row = entry.record.resource_estimate_record;
    if (!row) continue;
    const ram = row.ram_estimate_basis === generatedBases.ram;
    const storage = row.storage_estimate_basis === generatedBases.storage;
    if (!ram && !storage) continue;
    if (row.app_id !== entry.record.id || seen.has(row.app_id)) throw new Error("Invalid or duplicate resource identity in snapshot");
    seen.add(row.app_id);
    plan.push({ slug: entry.record.slug, app_id: row.app_id, record: row, ram, storage });
  }
  return plan;
}
