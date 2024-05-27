import * as core from '@actions/core';
import { installBinaryen } from './binaryen/install';
import { installTinyGo } from './tinygo/install';

setup();

async function setup() {
  try {
    const shouldInstallTinyGo = core.getInput('install-tinygo');
    if (shouldInstallTinyGo === 'false') {
      core.info('Skipping TinyGo installation');
    } else {
      const tinyGoVersion = core.getInput('tinygo-version');
      core.info(`Setting up tinygo version ${tinyGoVersion}`);
      await installTinyGo(tinyGoVersion);
    }

    const shouldInstallBinaryen = core.getInput('install-binaryen');
    if (shouldInstallBinaryen === 'false') {
      core.info('Skipping binaryen installation');
    } else {
      const binaryenVersion = core.getInput('binaryen-version');
      core.info(`Setting up binaryen version ${binaryenVersion}`);
      await installBinaryen(binaryenVersion);
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
}
