import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const verifier = fileURLToPath(new URL('../check-version.sh', import.meta.url));
const cases = [
  {
    name: 'accepts the exact version',
    output: 'tinygo version 0.40.1 linux/amd64',
    expectedStatus: 0,
  },
  {
    name: 'rejects a longer patch version',
    output: 'tinygo version 0.40.10 linux/amd64',
    expectedStatus: 1,
  },
  {
    name: 'rejects regex lookalikes',
    output: 'tinygo version 0x40x1 linux/amd64',
    expectedStatus: 1,
  },
  {
    name: 'rejects an unrelated output format',
    output: 'other version 0.40.1',
    expectedStatus: 1,
  },
  {
    name: 'rejects a failed version command',
    output: 'tinygo version 0.40.1 linux/amd64',
    commandStatus: 7,
    expectedStatus: 1,
  },
  {
    name: 'requires an expected version',
    output: 'tinygo version 0.40.1 linux/amd64',
    args: [],
    expectedStatus: 1,
  },
];

for (const scenario of cases) {
  test(
    scenario.name,
    {
      skip:
        process.platform === 'win32'
          ? 'fixture executable uses a POSIX shell'
          : false,
    },
    () => {
      const root = fs.mkdtempSync(
        path.join(os.tmpdir(), 'tinygo-version-check-'),
      );
      try {
        fs.writeFileSync(
          path.join(root, 'tinygo'),
          '#!/bin/sh\nprintf \'%s\\n\' "$FIXTURE_OUTPUT"\nexit "$FIXTURE_STATUS"\n',
          { mode: 0o755 },
        );
        const run = spawnSync(
          'sh',
          [verifier, ...(scenario.args ?? ['0.40.1'])],
          {
            encoding: 'utf8',
            timeout: 10000,
            env: {
              ...process.env,
              PATH: root + path.delimiter + process.env.PATH,
              FIXTURE_OUTPUT: scenario.output,
              FIXTURE_STATUS: String(scenario.commandStatus ?? 0),
            },
          },
        );
        assert.equal(
          run.status,
          scenario.expectedStatus,
          run.stdout + run.stderr,
        );
      } finally {
        fs.rmSync(root, { recursive: true, force: true });
      }
    },
  );
}
