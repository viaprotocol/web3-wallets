import esbuild from 'esbuild';
// Automatically exclude all node_modules from the bundled version
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import path from 'path';

function tsPathResolver(content) {
  const relativePath = path.relative(path.dirname(this.resourcePath), path.resolve(__dirname, '../src'));

  return content.replaceAll(`from "@/`, `from "${relativePath ? relativePath + '/' : './'}`);
}

esbuild
  .build({
    entryPoints: [
      './src/context/index.ts',
      './src/types.ts',
      './src/utils/index.ts',
      './src/constants.ts',
      './src/networks.ts'
    ],
    outdir: 'build',
    bundle: true,
    minifyWhitespace: true,
    minifySyntax: true,
    minifyIdentifiers: false,
    platform: 'browser',
    sourcemap: true,
    target: ['node16', 'esnext'],
    splitting: true,
    format: 'esm',
    inject: ['esbuild.shim.js'],
    plugins: [nodeExternalsPlugin()],
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
