import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

for (const scenario of [
  { name: 'uses the selected installation', missing: '', status: 0 },
  {
    name: 'rejects a cached TinyGo without its executable',
    missing: 'tinygo',
    status: 1,
  },
  {
    name: 'rejects Binaryen without its executable',
    missing: 'wasm-opt',
    status: 1,
  },
]) {
  test(
    scenario.name,
    {
      skip:
        process.platform === 'win32' ? 'fixtures use POSIX executables' : false,
    },
    () => {
      const root = fs.mkdtempSync(
        path.join(os.tmpdir(), 'installed-executable-'),
      );
      try {
        const cache = path.join(root, 'tools');
        const arch = os.arch() === 'x64' ? 'amd64' : os.arch();
        const tinygoBin = path.join(
          cache,
          'tinygo',
          '0.40.1',
          arch,
          'tinygo',
          'bin',
        );
        fs.mkdirSync(tinygoBin, { recursive: true });
        fs.writeFileSync(
          path.join(cache, 'tinygo', '0.40.1', `${arch}.complete`),
          '',
        );
        if (scenario.missing !== 'tinygo') {
          fs.writeFileSync(
            path.join(tinygoBin, 'tinygo'),
            '#!/bin/sh\necho selected-tinygo\n',
            { mode: 0o755 },
          );
        }
        const oldBin = path.join(root, 'old-bin');
        fs.mkdirSync(oldBin);
        for (const name of ['tinygo', 'wasm-opt']) {
          fs.writeFileSync(
            path.join(oldBin, name),
            '#!/bin/sh\necho unrelated >> "$FIXTURE_CALLED"\necho unrelated-tool\n',
            { mode: 0o755 },
          );
        }
        const fixture = path.join(root, 'fixture');
        const binaryenBin = path.join(fixture, 'binaryen-version_129', 'bin');
        fs.mkdirSync(binaryenBin, { recursive: true });
        if (scenario.missing !== 'wasm-opt') {
          fs.writeFileSync(
            path.join(binaryenBin, 'wasm-opt'),
            '#!/bin/sh\necho selected-wasm-opt\n',
            { mode: 0o755 },
          );
        }
        const archive = path.join(root, 'binaryen.tar.gz');
        execFileSync('tar', ['czf', archive, '-C', fixture, '.']);
        const preload = path.join(root, 'transport.cjs');
        fs.writeFileSync(
          preload,
          `
const fs = require('node:fs');
const { EventEmitter } = require('node:events');
function request(options, callback) {
  const req = new EventEmitter();
  req.setTimeout = () => req;
  req.end = () => queueMicrotask(() => {
    const response = fs.createReadStream(process.env.FIXTURE_ARCHIVE);
    response.statusCode = 200;
    response.headers = {};
    callback(response);
  });
  return req;
}
require('node:http').request = request;
require('node:https').request = request;
require('node:module').syncBuiltinESMExports();
`,
        );
        const githubPath = path.join(root, 'github-path');
        fs.writeFileSync(githubPath, '');
        const called = path.join(root, 'unrelated-called');
        const run = spawnSync(
          process.execPath,
          [
            '--require',
            preload,
            fileURLToPath(new URL('../dist/index.js', import.meta.url)),
          ],
          {
            cwd: root,
            encoding: 'utf8',
            timeout: 10000,
            env: {
              ...process.env,
              PATH: oldBin + path.delimiter + process.env.PATH,
              RUNNER_TOOL_CACHE: cache,
              RUNNER_TEMP: root,
              GITHUB_PATH: githubPath,
              FIXTURE_CALLED: called,
              FIXTURE_ARCHIVE: archive,
              'INPUT_TINYGO-VERSION': '0.40.1',
              'INPUT_INSTALL-BINARYEN': 'true',
              'INPUT_BINARYEN-VERSION': '129',
            },
          },
        );
        assert.equal(run.status, scenario.status, run.stdout + run.stderr);
        assert.equal(
          fs.existsSync(called),
          false,
          'must never invoke an unrelated executable from PATH',
        );
        if (scenario.missing) {
          assert.match(run.stdout, /Unable to locate executable file/);
        } else {
          assert.match(run.stdout, /selected-tinygo/);
          assert.match(run.stdout, /selected-wasm-opt/);
        }
      } finally {
        fs.rmSync(root, { recursive: true, force: true });
      }
    },
  );
}
