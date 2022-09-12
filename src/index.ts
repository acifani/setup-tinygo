import * as core from '@actions/core';
import { installBinaryen } from './binaryen/install';
import { installTinyGo } from './tinygo/install';

setup();

async function setup() {
  try {
    const tinyGoVersion = core.getInput('tinygo-version');
    core.info(`Setting up tinygo version ${tinyGoVersion}`);
    const binaryenVersion = core.getInput('binaryen-version');
    core.info(`Setting up binaryen version ${binaryenVersion}`);

    await installTinyGo(tinyGoVersion);
    await installBinaryen(binaryenVersion);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}
