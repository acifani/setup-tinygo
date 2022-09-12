import os from 'os';

export function getPlatform(): string {
  const platform = os.platform();
  return platform === 'win32' ? 'windows' : platform;
}

export function getArch(): string {
  const arch = os.arch();
  return arch === 'x64' ? 'amd64' : arch;
}
