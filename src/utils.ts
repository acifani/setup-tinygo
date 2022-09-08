import * as core from '@actions/core';
import cp from 'child_process';

export function printCommand(command: string) {
  const output = cp.execSync(command).toString();
  core.info(output);
}
