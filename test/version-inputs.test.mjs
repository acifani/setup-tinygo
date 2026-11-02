import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import {
  validateBinaryenVersion,
  validateTinyGoVersion,
} from '../src/versions.ts';

for (const version of ['0.39.0', '0.40.1', '1.0.0', '12.34.56']) {
  test(`accepts exact TinyGo version ${version}`, () => {
    assert.doesNotThrow(() => validateTinyGoVersion(version));
  });
}

for (const version of ['1', '129', '1000']) {
  test(`accepts integer Binaryen version ${version}`, () => {
    assert.doesNotThrow(() => validateBinaryenVersion(version));
  });
}

const invalidInputs = [
  '',
  ' ',
  'latest',
  '*',
  '../version',
  'version/file',
  'version\\file',
  '129#fragment',
  '129?query',
  '%2e%2e',
  '129;other',
  '129\n',
  '129\r',
  '129\t',
  '129\0',
  ' 129',
  '129 ',
];

for (const version of [
  ...invalidInputs,
  '0.40',
  'v0.40.1',
  '^0.40.1',
  '00.40.1',
  '0.40.01',
  '0.40.1\n',
]) {
  test(`rejects unsupported TinyGo input ${JSON.stringify(version)}`, () => {
    assert.throws(
      () => validateTinyGoVersion(version),
      /tinygo-version must be an exact version/,
    );
  });
}

for (const version of [
  ...invalidInputs,
  '0',
  '0129',
  '-129',
  '+129',
  '129.0.0',
  'v129',
]) {
  test(`rejects unsupported Binaryen input ${JSON.stringify(version)}`, () => {
    assert.throws(
      () => validateBinaryenVersion(version),
      /binaryen-version must be a positive integer/,
    );
  });
}

test('the shipped action rejects an invalid version before accessing the tool cache', () => {
  const env = { ...process.env, 'INPUT_TINYGO-VERSION': 'invalid/version' };
  delete env.RUNNER_TOOL_CACHE;
  delete env.RUNNER_TEMP;
  const result = spawnSync(process.execPath, [path.resolve('dist/index.js')], {
    env,
    encoding: 'utf8',
    timeout: 10000,
  });
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /tinygo-version must be an exact version/);
  assert.doesNotMatch(
    result.stdout,
    /Checking cache|Downloading|RUNNER_TOOL_CACHE/,
  );
});
