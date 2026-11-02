import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

test(
  'repeated Binaryen installations download once and reuse the completed cache',
  {
    skip:
      process.platform === 'win32'
        ? 'fixture executables use a POSIX shell'
        : false,
  },
  () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'binaryen-cache-'));
    try {
      const arch = os.arch() === 'x64' ? 'amd64' : os.arch();
      const binaryenArch =
        os.arch() === 'x64'
          ? 'x86_64'
          : os.arch() === 'arm64' && os.platform() === 'linux'
            ? 'aarch64'
            : os.arch();
      const platform = os.platform() === 'darwin' ? 'macos' : os.platform();
      const cache = path.join(root, 'tools');
      const tinygo = path.join(
        cache,
        'tinygo',
        '0.40.1',
        arch,
        'tinygo',
        'bin',
      );
      fs.mkdirSync(tinygo, { recursive: true });
      fs.writeFileSync(
        path.join(tinygo, 'tinygo'),
        '#!/bin/sh\necho tinygo-fixture\n',
        { mode: 0o755 },
      );
      fs.writeFileSync(
        path.join(cache, 'tinygo', '0.40.1', arch + '.complete'),
        '',
      );
      const fixture = path.join(root, 'fixture');
      const bin = path.join(fixture, 'binaryen-version_129', 'bin');
      fs.mkdirSync(bin, { recursive: true });
      fs.writeFileSync(
        path.join(bin, 'wasm-opt'),
        '#!/bin/sh\necho wasm-opt-version-129\n',
        { mode: 0o755 },
      );
      const archive = path.join(root, 'binaryen.tar.gz');
      execFileSync('tar', ['czf', archive, '-C', fixture, '.']);
      const requests = path.join(root, 'requests.jsonl');
      const githubPath = path.join(root, 'github-path');
      fs.writeFileSync(githubPath, '');
      const preload = path.join(root, 'transport.cjs');
      fs.writeFileSync(
        preload,
        `
const fs = require('node:fs');
const { EventEmitter } = require('node:events');
function request(options, callback) {
  fs.appendFileSync(process.env.FIXTURE_REQUESTS, JSON.stringify({host: options.host, path: options.path}) + '\\n');
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
      const bundle = fileURLToPath(
        new URL('../dist/index.js', import.meta.url),
      );
      for (let invocation = 0; invocation < 2; invocation++) {
        const run = spawnSync(
          process.execPath,
          ['--require', preload, bundle],
          {
            cwd: root,
            encoding: 'utf8',
            timeout: 10000,
            env: {
              ...process.env,
              RUNNER_TOOL_CACHE: cache,
              RUNNER_TEMP: root,
              GITHUB_PATH: githubPath,
              FIXTURE_ARCHIVE: archive,
              FIXTURE_REQUESTS: requests,
              'INPUT_TINYGO-VERSION': '0.40.1',
              'INPUT_INSTALL-BINARYEN': 'true',
              'INPUT_BINARYEN-VERSION': '129',
            },
          },
        );
        assert.equal(run.status, 0, run.stdout + run.stderr);
        assert.match(run.stdout, /wasm-opt-version-129/);
      }
      const downloads = fs
        .readFileSync(requests, 'utf8')
        .trim()
        .split('\n')
        .map(JSON.parse);
      assert.deepEqual(downloads, [
        {
          host: 'github.com',
          path: `/WebAssembly/binaryen/releases/download/version_129/binaryen-version_129-${binaryenArch}-${platform}.tar.gz`,
        },
      ]);
      const cachedExecutable = path.join(
        cache,
        'binaryen',
        '129.0.0',
        binaryenArch,
        'binaryen-version_129',
        'bin',
        'wasm-opt',
      );
      assert.ok(fs.existsSync(cachedExecutable));
      assert.ok(
        fs.existsSync(
          path.join(cache, 'binaryen', '129.0.0', binaryenArch + '.complete'),
        ),
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  },
);
