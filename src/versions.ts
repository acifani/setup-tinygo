export function validateTinyGoVersion(version: string): void {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error('tinygo-version must be an exact version in X.Y.Z format');
  }
}

export function validateBinaryenVersion(version: string): void {
  if (!/^[1-9]\d*$/.test(version)) {
    throw new Error('binaryen-version must be a positive integer');
  }
}
