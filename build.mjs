import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  platform: 'node',
  target: 'node24',
  format: 'esm',
  bundle: true,
  outdir: 'dist',
  loader: { '.ts': 'ts' },
});
