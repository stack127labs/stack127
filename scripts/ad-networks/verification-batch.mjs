// Admit each domain against the deadline. Already admitted requests finish within
// their fetch timeouts; all unstarted claims are released, including on failure.
export async function runVerificationBatch(publishers, {
  concurrency, deadline, process: processPublisher, release = async () => {},
  now = Date.now, shouldStop = () => false,
}) {
  let cursor = 0, failed = false;
  try {
    const results = await Promise.allSettled(Array.from({ length: Math.min(concurrency, publishers.length) }, async () => {
      while (cursor < publishers.length && !failed && !shouldStop() && now() < deadline) {
        const publisher = publishers[cursor++];
        try { await processPublisher(publisher); }
        catch (error) { failed = true; throw error; }
      }
    }));
    const failure = results.find(result => result.status === "rejected");
    if (failure) throw failure.reason;
  } finally {
    for (const publisher of publishers.slice(cursor)) await release(publisher.id);
  }
}
