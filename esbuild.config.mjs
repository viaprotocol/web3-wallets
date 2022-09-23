import esbuild from 'esbuild'
// Automatically exclude all node_modules from the bundled version
import { nodeExternalsPlugin } from 'esbuild-node-externals'

esbuild
  .build({
    entryPoints: [
      './src/index.ts',
      './src/context/index.ts',
      './src/types.ts',
      './src/utils/common.ts',
      './src/utils/cosmos.ts',
      './src/utils/evm.ts',
      './src/utils/solana.ts',
      './src/utils/wallet.ts',
      './src/hooks/index.ts',
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
    plugins: [nodeExternalsPlugin()]
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
