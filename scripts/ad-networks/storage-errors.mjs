// Keep local infrastructure failures fatal through network/parser wrappers.
const filesystemCodes = new Set([
  'ENOSPC', 'EDQUOT', 'EIO', 'EROFS', 'EACCES', 'EPERM', 'EMFILE', 'ENFILE',
  'ENOENT', 'ENOTDIR', 'EISDIR', 'EFBIG', 'EBADF', 'ENOMEM',
]);

export function isStorageError(error, seen = new Set()) {
  if (!error || typeof error !== 'object' || seen.has(error)) return false;
  seen.add(error);
  return Boolean(error.discoveryStorage || filesystemCodes.has(error.code)
    || /^(?:ERR_)?SQLITE_/.test(error.code ?? '')
    || isStorageError(error.cause, seen)
    || (Array.isArray(error.errors) && error.errors.some(cause => isStorageError(cause, seen))));
}

export function storageError(error) {
  return Object.assign(new Error(error.message, { cause: error }), { discoveryStorage: true });
}
