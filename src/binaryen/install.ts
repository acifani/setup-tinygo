import * as core from '@actions/core';
import * as io from '@actions/io';
import * as tool from '@actions/tool-cache';
import path from 'path';
import { printCommand } from '../utils';
import { getArch, getPlatform } from './sys';

const toolName = 'binaryen';
const arch = getArch();
const platform = getPlatform();

export async function installBinaryen(version: string): Promise<void> {
  const installPath = await extract(version);
  return addToPath(installPath, version);
}

async function extract(version: string): Promise<string> {
  core.debug(`Checking cache for binaryen v${version} ${arch}`);
  const cachedDirectory = tool.find(toolName, version, arch);
  if (cachedDirectory) {
    // tool version found in cache
    return cachedDirectory;
  }

  core.debug(`Downloading binaryen v${version} for ${platform} ${arch}`);
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
  const downloadURL = `https://github.com/WebAssembly/binaryen/releases/download/version_${version}/binaryen-version_${version}-${arch}-${platform}.tar.gz`;
  core.debug(`Downloading from ${downloadURL}`);
  const downloadPath = await tool.downloadTool(downloadURL);
  core.debug(`Downloaded binaryen release to ${downloadPath}`);
  return downloadPath;
}

async function extractArchive(downloadPath: string): Promise<string> {
  return tool.extractTar(downloadPath);
}

async function addToPath(installDir: string, version: string) {
  const binaryen = `binaryen-version_${version}`;
  core.info(`Adding ${installDir}/${binaryen}/bin to PATH`);
  core.addPath(path.join(installDir, binaryen, 'bin'));
  const found = await io.findInPath('wasm-opt');
  core.debug(`Found in path: ${found}`);
  const wasmopt = await io.which('wasm-opt');
  printCommand(`${wasmopt} --version`);
}
