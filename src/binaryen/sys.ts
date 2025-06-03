import os from 'os';

const platformMap: Record<string, string> = {
  win32: 'windows',
  darwin: 'macos',
};

export function getPlatform(): string {
  const platform = os.platform();
  return platformMap[platform] ?? platform;
}

export function getArch(platform: string): string {
  const arch = os.arch();
  switch (arch) {
    case 'arm64':
      return platform === 'linux' ? 'aarch64' : 'arm64';
    case 'x64':
      return 'x86_64';
    default:
      return arch;
  }
}
