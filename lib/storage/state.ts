import { deepFreeze } from "./freeze.ts";
import {
  STORAGE_ENGINE_VERSION,
  MAX_STORAGE_STATE_JSON_BYTES,
  STORAGE_STATE_SCHEMA,
  STORAGE_STATE_SCHEMA_VERSION,
  StorageStateError,
  type StorageStateEnvelope,
} from "./types.ts";

const BIGINT_TAG = "$version127BigInt";
const unsafeKeys = new Set(["__proto__", "prototype", "constructor"]);

function assertSafeTree(
  value: unknown,
  path = "payload",
  options: Readonly<{ rejectBigIntTag?: boolean }> = {},
  ancestors = new WeakSet<object>(),
): void {
  if (value === null || typeof value !== "object") return;
  if (ancestors.has(value)) {
    throw new StorageStateError("cyclic_state", `Storage state contains a cycle at ${path}.`);
  }
  ancestors.add(value);
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafeTree(item, `${path}[${index}]`, options, ancestors));
    ancestors.delete(value);
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (unsafeKeys.has(key)) {
      throw new StorageStateError("unsafe_key", `Storage state contains an unsafe key at ${path}.${key}.`);
    }
    if (options.rejectBigIntTag && key === BIGINT_TAG) {
      throw new StorageStateError("reserved_key", `Storage state uses a reserved key at ${path}.${key}.`);
    }
    assertSafeTree(child, `${path}.${key}`, options, ancestors);
  }
  ancestors.delete(value);
}

function encodeBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeBase64Url(encoded: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(encoded)) {
    throw new StorageStateError("invalid_encoding", "Storage state is not valid base64url data.");
  }
  const base64 = encoded.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  try {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    if (bytes.byteLength > MAX_STORAGE_STATE_JSON_BYTES) {
      throw new StorageStateError("state_too_large", "Storage state exceeds the URL-state size limit.");
    }
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch (error) {
    if (error instanceof StorageStateError) throw error;
    throw new StorageStateError("invalid_encoding", "Storage state could not be decoded.");
  }
}

function reviveBigInts(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reviveBigInts);
  if (value === null || typeof value !== "object") return value;

  const entries = Object.entries(value);
  if (entries.length === 1 && entries[0][0] === BIGINT_TAG) {
    const encoded = entries[0][1];
    if (typeof encoded !== "string" || !/^-?(0|[1-9]\d*)$/.test(encoded)) {
      throw new StorageStateError("invalid_bigint", "Storage state contains an invalid integer value.");
    }
    return BigInt(encoded);
  }

  return Object.fromEntries(entries.map(([key, child]) => [key, reviveBigInts(child)]));
}

function isPositiveVersion(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 1;
}

export function encodeStorageState<TPayload>(input: Readonly<{
  calculatorId: string;
  calculatorVersion: number;
  inputVersion: number;
  payload: TPayload;
}>) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.calculatorId)) {
    throw new StorageStateError("invalid_calculator", "Storage state needs a valid calculator ID.");
  }
  if (!isPositiveVersion(input.calculatorVersion) || !isPositiveVersion(input.inputVersion)) {
    throw new StorageStateError("invalid_version", "Storage state versions must be positive safe integers.");
  }
  assertSafeTree(input.payload, "payload", { rejectBigIntTag: true });

  const envelope: StorageStateEnvelope<TPayload> = {
    schema: STORAGE_STATE_SCHEMA,
    schemaVersion: STORAGE_STATE_SCHEMA_VERSION,
    engineVersion: STORAGE_ENGINE_VERSION,
    calculatorId: input.calculatorId,
    calculatorVersion: input.calculatorVersion,
    inputVersion: input.inputVersion,
    payload: input.payload,
  };
  const json = JSON.stringify(envelope, (_key, value: unknown) => (
    typeof value === "bigint" ? { [BIGINT_TAG]: value.toString() } : value
  ));
  if (new TextEncoder().encode(json).byteLength > MAX_STORAGE_STATE_JSON_BYTES) {
    throw new StorageStateError("state_too_large", "Storage state exceeds the URL-state size limit.");
  }
  return encodeBase64Url(json);
}

export function decodeStorageState(encoded: string): StorageStateEnvelope {
  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeBase64Url(encoded));
  } catch (error) {
    if (error instanceof StorageStateError) throw error;
    throw new StorageStateError("invalid_json", "Storage state does not contain valid JSON.");
  }

  assertSafeTree(parsed, "state");
  const revived = reviveBigInts(parsed);
  if (revived === null || typeof revived !== "object" || Array.isArray(revived)) {
    throw new StorageStateError("invalid_envelope", "Storage state envelope is invalid.");
  }

  const envelope = revived as Record<string, unknown>;
  if (envelope.schema !== STORAGE_STATE_SCHEMA || envelope.schemaVersion !== STORAGE_STATE_SCHEMA_VERSION) {
    throw new StorageStateError("unsupported_schema", "Storage state uses an unsupported schema version.");
  }
  if (!isPositiveVersion(envelope.engineVersion) || envelope.engineVersion > STORAGE_ENGINE_VERSION) {
    throw new StorageStateError("unsupported_engine", "Storage state requires an unsupported engine version.");
  }
  if (typeof envelope.calculatorId !== "string"
    || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(envelope.calculatorId)) {
    throw new StorageStateError("invalid_calculator", "Storage state has an invalid calculator ID.");
  }
  if (!isPositiveVersion(envelope.calculatorVersion) || !isPositiveVersion(envelope.inputVersion)) {
    throw new StorageStateError("invalid_version", "Storage state has invalid version fields.");
  }
  if (!("payload" in envelope)) {
    throw new StorageStateError("missing_payload", "Storage state has no input payload.");
  }

  return deepFreeze(envelope as StorageStateEnvelope);
}
