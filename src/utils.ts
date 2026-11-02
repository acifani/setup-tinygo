import * as core from '@actions/core';
import cp from 'node:child_process';

export function printCommand(executable: string, args: readonly string[]) {
  const output = cp.execFileSync(executable, args).toString();
  core.info(output);
}
