import * as core from '@actions/core';
import * as io from '@actions/io';
import * as tool from '@actions/tool-cache';
import path from 'path';
import { printCommand } from '../utils';
import { getArch, getPlatform } from './sys';

const toolName = 'tinygo';
const arch = getArch();
const platform = getPlatform();

export async function installTinyGo(version: string): Promise<void> {
  const installPath = await extract(version);
  return addToPath(installPath);
}

async function extract(version: string): Promise<string> {
  core.debug(`Checking cache for tinygo v${version} ${arch}`);
  const cachedDirectory = tool.find(toolName, version, arch);
  if (cachedDirectory) {
    // tool version found in cache
    return cachedDirectory;
  }

  core.debug(`Downloading tinygo v${version} for ${platform} ${arch}`);
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
  const downloadURL = `https://github.com/tinygo-org/tinygo/releases/download/v${version}/tinygo${version}.${platform}-${arch}.${extension}`;
  core.debug(`Downloading from ${downloadURL}`);
  const downloadPath = await tool.downloadTool(downloadURL);
  core.debug(`Downloaded tinygo release to ${downloadPath}`);
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

async function addToPath(installDir: string) {
  core.info(`Adding ${installDir}/tinygo/bin to PATH`);
  core.addPath(path.join(installDir, 'tinygo', 'bin'));
  const found = await io.findInPath('tinygo');
  core.debug(`Found in path: ${found}`);
  const tinygo = await io.which('tinygo');
  printCommand(`${tinygo} version`);
  printCommand(`${tinygo} env`);
}
