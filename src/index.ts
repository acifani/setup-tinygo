import * as io from '@actions/io';
import cp from 'child_process';
import * as core from '@actions/core';
import path from 'path';
import { install } from './install';

setup();

async function setup() {
  try {
    const version = core.getInput('tinygo-version');
    core.info(`Setting up tinygo version ${version}`);

    const installDir = await install(version);
    await addTinyGoToPath(installDir);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

async function addTinyGoToPath(installDir: string) {
  core.info(`Adding ${installDir}/bin to PATH`);
  core.addPath(path.join(installDir, 'bin'));
  const found = await io.findInPath('tinygo');
  core.info(`Found in path: ${found}`);
  printCommand(`ls ${installDir}`);
  const tinygo = await io.which('tinygo');
  printCommand(`${tinygo} version`);
  printCommand(`${tinygo} env`);
}

function printCommand(command: string) {
  const output = cp.execSync(command).toString();
  core.info(output);
}
