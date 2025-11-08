import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  target: 'es2020',
  splitting: false,
  treeshake: true,
});
