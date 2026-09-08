// Call inside a read-only transaction; the caller owns rollback and commit.
export async function readAuditCursor(client, name, select) {
  if (!/^[a-z_]+$/.test(name)) throw new Error("Invalid audit cursor name");
  await client.query(`declare ${name} no scroll cursor for ${select}`);
  const rows = [];
  while (true) {
    const page = await client.query(`fetch forward 100 from ${name}`);
    if (page.rows.length === 0) break;
    rows.push(...page.rows);
  }
  await client.query(`close ${name}`);
  return rows;
}
