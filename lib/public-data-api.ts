type PublicDataEnvironment = Readonly<Record<string, string | undefined>>;

type PublicDataTable = "stack127_pages" | "stack127_tool_pages" | "stack127_tool_catalogs" | "stack127_tool_catalog_memberships";

type PublicReadOptions<T> = Readonly<{
  dataApiRead: () => Promise<T>;
  environment?: PublicDataEnvironment;
  postgresRead: () => Promise<T>;
}>;

type SelectOptions = Readonly<{
  environment?: PublicDataEnvironment;
  fetchImplementation?: typeof fetch;
}>;

const publicDataAttempts = 3;

function waitForRetry(attempt: number) {
  return new Promise((resolve) => setTimeout(resolve, attempt * 250));
}

export function canReadPublicDataApi(environment: PublicDataEnvironment = process.env) {
  return Boolean(environment.SUPABASE_URL && environment.SUPABASE_PUBLISHABLE_KEY);
}

export function preferPublicDataApi(environment: PublicDataEnvironment = process.env) {
  return environment.NODE_ENV !== "production" && canReadPublicDataApi(environment);
}

export async function readPublicData<T>({
  dataApiRead,
  environment = process.env,
  postgresRead,
}: PublicReadOptions<T>) {
  if (preferPublicDataApi(environment)) {
    try {
      return await dataApiRead();
    } catch (dataApiError) {
      try {
        return await postgresRead();
      } catch {
        throw dataApiError;
      }
    }
  }

  try {
    return await postgresRead();
  } catch (postgresError) {
    if (!canReadPublicDataApi(environment)) throw postgresError;

    try {
      return await dataApiRead();
    } catch {
      throw postgresError;
    }
  }
}

export async function selectPublicRows<T>(
  table: PublicDataTable,
  parameters: Readonly<Record<string, string>>,
  {
    environment = process.env,
    fetchImplementation = fetch,
  }: SelectOptions = {},
): Promise<T[]> {
  const projectUrl = environment.SUPABASE_URL;
  const publishableKey = environment.SUPABASE_PUBLISHABLE_KEY;
  if (!projectUrl || !publishableKey) throw new Error("Supabase public Data API configuration is missing.");

  const url = new URL(`/rest/v1/${table}`, projectUrl);
  for (const [name, value] of Object.entries(parameters)) url.searchParams.set(name, value);

  let response: Response | undefined;
  for (let attempt = 1; attempt <= publicDataAttempts; attempt += 1) {
    try {
      response = await fetchImplementation(url, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${publishableKey}`,
          apikey: publishableKey,
        },
      });
    } catch (error) {
      if (attempt === publicDataAttempts) throw error;
      await waitForRetry(attempt);
      continue;
    }

    if (response.ok) break;
    if (response.status < 500 || attempt === publicDataAttempts) {
      throw new Error(`Supabase public Data API read failed with status ${response.status}.`);
    }
    await waitForRetry(attempt);
  }

  if (!response?.ok) throw new Error("Supabase public Data API read failed without a response.");

  const rows: unknown = await response.json();
  if (!Array.isArray(rows)) throw new Error("Supabase public Data API returned an unexpected response.");
  return rows as T[];
}
