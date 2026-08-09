import { encodeStorageState, decodeStorageState } from "./state.ts";
import {
  STORAGE_ENGINE_VERSION,
  StorageValidationError,
  type StorageCalculationResult,
  type StorageCalculatorAdapter,
  type StorageCalculatorRegistry,
} from "./types.ts";

type StoredAdapter = Readonly<{
  calculatorId: string;
  calculationVersion: number;
  inputVersion: number;
  validateInput: (input: unknown) => boolean;
  calculate: (input: unknown) => StorageCalculationResult<unknown>;
}>;

function validId(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function validVersion(value: number) {
  return Number.isSafeInteger(value) && value >= 1;
}

export function createStorageCalculatorRegistry(): StorageCalculatorRegistry {
  const calculators = new Map<string, Map<number, StoredAdapter>>();

  function adapterFor(calculatorId: string, calculationVersion: number) {
    const adapter = calculators.get(calculatorId)?.get(calculationVersion);
    if (!adapter) {
      throw new StorageValidationError(`Storage calculator ${calculatorId} version ${calculationVersion} is not registered.`);
    }
    return adapter;
  }

  function register<TInput, TValues>(adapter: StorageCalculatorAdapter<TInput, TValues>) {
    if (!validId(adapter.calculatorId)
      || !validVersion(adapter.calculationVersion)
      || !validVersion(adapter.inputVersion)) {
      throw new StorageValidationError("Storage calculator adapter has an invalid ID or version.");
    }
    let versions = calculators.get(adapter.calculatorId);
    if (!versions) {
      versions = new Map<number, StoredAdapter>();
      calculators.set(adapter.calculatorId, versions);
    }
    if (versions.has(adapter.calculationVersion)) {
      throw new StorageValidationError(
        `Storage calculator ${adapter.calculatorId} version ${adapter.calculationVersion} is already registered.`,
      );
    }
    versions.set(adapter.calculationVersion, adapter as unknown as StoredAdapter);
  }

  function latest(calculatorId: string) {
    const versions = calculators.get(calculatorId);
    if (!versions || versions.size === 0) {
      throw new StorageValidationError(`Storage calculator ${calculatorId} is not registered.`);
    }
    const version = Math.max(...versions.keys());
    return adapterFor(calculatorId, version) as StorageCalculatorAdapter<unknown, unknown>;
  }

  function run(calculatorId: string, calculationVersion: number, input: unknown) {
    const adapter = adapterFor(calculatorId, calculationVersion);
    if (!adapter.validateInput(input)) {
      throw new StorageValidationError(
        `Input is invalid for storage calculator ${calculatorId} version ${calculationVersion}.`,
      );
    }

    const result = adapter.calculate(input);
    if (result.engineVersion !== STORAGE_ENGINE_VERSION
      || result.calculator.id !== calculatorId
      || result.calculator.version !== calculationVersion) {
      throw new StorageValidationError("Storage calculator returned a result with a mismatched engine or calculator version.");
    }
    return result;
  }

  function encode(calculatorId: string, input: unknown, calculationVersion?: number) {
    const adapter = calculationVersion === undefined
      ? latest(calculatorId) as unknown as StoredAdapter
      : adapterFor(calculatorId, calculationVersion);
    if (!adapter.validateInput(input)) {
      throw new StorageValidationError(
        `Input is invalid for storage calculator ${calculatorId} version ${adapter.calculationVersion}.`,
      );
    }
    return encodeStorageState({
      calculatorId,
      calculatorVersion: adapter.calculationVersion,
      inputVersion: adapter.inputVersion,
      payload: input,
    });
  }

  function runEncoded(encodedState: string) {
    const state = decodeStorageState(encodedState);
    const adapter = adapterFor(state.calculatorId, state.calculatorVersion);
    if (state.inputVersion !== adapter.inputVersion) {
      throw new StorageValidationError(
        `Storage state input version ${state.inputVersion} is not supported by ${state.calculatorId} version ${state.calculatorVersion}.`,
      );
    }
    return run(state.calculatorId, state.calculatorVersion, state.payload);
  }

  return Object.freeze({ register, latest, encode, run, runEncoded });
}
