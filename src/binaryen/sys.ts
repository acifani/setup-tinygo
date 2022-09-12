import os from 'os';

const platformMap: Record<string, string> = {
  win32: 'windows',
  darwin: 'macos',
};

export function getPlatform(): string {
  const platform = os.platform();
  return platformMap[platform] ?? platform;
}

export function getArch(): string {
  const arch = os.arch();
  return arch === 'x64' ? 'x86_64' : arch;
}
