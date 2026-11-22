// Bound the response body as well as headers, and retry only transient failures.
export async function request(url, options = {}, read = response => response.text()) {
  const { redirectOrigin, ...fetchOptions } = options;
  const redirectError = message => Object.assign(new Error(message), { retryable: false });
  for (let attempt = 0; ; attempt++) {
    let retryAfter = 0;
    try {
      // One deadline includes the full redirect chain and response body.
      const signal = AbortSignal.timeout(45_000);
      let target = new URL(url);
      let response;
      for (let redirects = 0; ; redirects++) {
        if (redirectOrigin && (target.origin !== redirectOrigin || target.username || target.password)) {
          throw redirectError(`Refusing redirect outside ${redirectOrigin}`);
        }
        response = await fetch(target.href, { ...fetchOptions, ...(redirectOrigin ? { redirect: "manual" } : {}), signal });
        if (!redirectOrigin || ![301, 302, 303, 307, 308].includes(response.status)) break;
        const location = response.headers.get("location");
        await response.body?.cancel();
        if (!location) throw redirectError("Redirect response is missing Location");
        if (redirects >= 5) throw redirectError("Too many API redirects (maximum 5)");
        try { target = new URL(location, target); }
        catch { throw redirectError("Invalid API redirect Location"); }
      }
      if (!response.ok) {
        retryAfter = Math.min(60_000, Math.max(0, Number(response.headers.get("retry-after")) * 1000 || Date.parse(response.headers.get("retry-after")) - Date.now() || (response.status === 429 ? 30_000 : 0)));
        const error = Object.assign(new Error(`HTTP ${response.status}: ${url}`), {
          retryable: [408, 425, 429].includes(response.status) || response.status >= 500,
          status: response.status,
        });
        await response.body?.cancel();
        throw error;
      }
      return await read(response);
    } catch (error) {
      if (error.retryable === false || attempt >= 2) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.max(retryAfter, 500 * 2 ** attempt)));
    }
  }
}
