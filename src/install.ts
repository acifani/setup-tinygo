import * as tool from '@actions/tool-cache';
import * as core from '@actions/core';
import { getArch, getPlatform } from './sys';

const toolName = 'tinygo';
const arch = getArch();
const platform = getPlatform();

export async function install(version: string): Promise<string> {
  const cachedDirectory = tool.find(toolName, version, arch);
  if (cachedDirectory) {
    // tool version found in cache
    return cachedDirectory;
  }

  core.debug(
    `Attempting to download tinygo v${version} for ${platform} ${arch}`,
  );
  try {
    const downloadPath = await download(version);
    const extractedPath = await extractArchive(downloadPath);
    const cachedPath = await tool.cacheDir(
      extractedPath,
      toolName,
      version,
      arch,
    );

    return cachedPath;
  } catch (error: any) {
    throw new Error(`Failed to download version ${version}: ${error}`);
  }
}

async function download(version: string): Promise<string> {
  const extension = platform === 'windows' ? 'zip' : 'tar.gz';
  const downloadPath = await tool.downloadTool(
    `https://github.com/tinygo-org/tinygo/releases/download/v${version}/tinygo${version}.${platform}-${arch}.${extension}`,
  );
  return downloadPath;
}

async function extractArchive(downloadPath: string): Promise<string> {
  let extractedPath = '';
  if (platform === 'windows') {
    extractedPath = await tool.extractZip(downloadPath);
  } else {
    extractedPath = await tool.extractTar(downloadPath);
  }

  return extractedPath;
}
