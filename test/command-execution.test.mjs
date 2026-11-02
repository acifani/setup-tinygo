import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { printCommand } from '../src/utils.ts';

test('runs an executable with spaces in its path and preserves literal arguments', () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'setup tinygo command '),
  );
  try {
    const executable = path.join(
      directory,
      process.platform === 'win32' ? 'node runner.exe' : 'node runner',
    );
    fs.copyFileSync(
      process.execPath,
      executable,
      fs.constants.COPYFILE_FICLONE,
    );
    fs.chmodSync(executable, 0o755);
    const script = path.join(directory, 'record arguments.cjs');
    const result = path.join(directory, 'arguments.json');
    fs.writeFileSync(
      script,
      "require('node:fs').writeFileSync(process.argv[2], JSON.stringify(process.argv.slice(3)));",
    );
    const args = [
      'two words',
      'literal & value',
      'a;b',
      '$ordinary',
      '"quoted"',
    ];

    printCommand(executable, [script, result, ...args]);

    assert.deepEqual(JSON.parse(fs.readFileSync(result, 'utf8')), args);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('reports a failed executable instead of treating it as successful', () => {
  assert.throws(() =>
    printCommand(process.execPath, ['-e', 'process.exit(7)']),
  );
});
