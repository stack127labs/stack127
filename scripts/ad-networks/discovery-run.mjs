import { isStorageError } from './storage-errors.mjs';

// One isolated upstream failure is a warning. A persistent failure must stay red.
// Storage failures are never downgraded to upstream warnings.
export async function runDiscoverySources({ sources, state, processSource, saveSuccess, saveFailure, log = console.log, warn = console.error }) {
  let failures = 0, repeated = false;
  for (const source of sources) {
    const previous = state[source.key];
    let result;
    try {
      result = await processSource(source);
    } catch (error) {
      if (isStorageError(error)) throw error;
      failures++;
      const consecutive = previous?.lastStatus === 'failed';
      repeated ||= consecutive;
      state[source.key] = { ...previous, url: source.url, lastStatus: 'failed', lastError: error.message };
      await saveFailure(source, error, state[source.key]);
      warn(JSON.stringify({ source: source.key, status: 'failed', error: error.message, consecutiveFailure: consecutive }));
      warn(`${consecutive ? 'ERROR' : 'WARNING'}: discovery source ${source.key} failed${consecutive ? ' on consecutive runs' : ' once; retry next run'}: ${error.message}`);
      continue;
    }
    state[source.key] = { ...state[source.key], lastStatus: 'complete', lastError: null };
    await saveSuccess(source, state[source.key]);
    log(JSON.stringify(result));
  }
  if (failures === sources.length) warn('ERROR: every discovery source failed; no source completed');
  return failures === sources.length || repeated ? 1 : 0;
}
