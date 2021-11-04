import core from '@actions/core';
import path from 'path';
import { install } from './install';

setup();

async function setup() {
  try {
    const version = core.getInput('tinygo-version');
    const installDir = await install(version);
    core.addPath(path.join(installDir, 'bin'));
  } catch (error: any) {
    core.setFailed(error.message);
  }
}
