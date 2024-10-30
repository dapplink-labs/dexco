import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import vitePluginCommonjs from 'vite-plugin-commonjs'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { createRequire } from 'module'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasmLoader from './plugins/vite-plugin-wasm-loader'
const require = createRequire(import.meta.url)

export default defineConfig({
  plugins: [
    vue(),
    wasmLoader(),
    topLevelAwait(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
      include: ['stream', 'buffer']
    }),
    vitePluginCommonjs(),
    {
      name: 'resolve-wallet-sdk-deps',
      resolveId(source, importer) {
        if (importer && importer.includes('lib/wallet-sdk') && !source.startsWith('.')) {
          try {
            return require.resolve(source, { paths: [path.resolve(__dirname, 'lib/wallet-sdk')] })
          } catch (e) {
            console.warn(`Failed to resolve ${source} from wallet-sdk`)
          }
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@wallet-sdk': path.resolve(__dirname, 'lib/wallet-sdk/dist/esm'),
      'crypto': 'crypto-browserify'
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.wasm']
  },
  define: {
    'process.env': {},
    global: 'globalThis'
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/lib\/wallet-sdk\/.*/, /node_modules\/.*/]
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      supported: { bigint: true }
    },
    include: [
      'buffer', 
      'crypto-browserify', 
      'stream-browserify', 
    ],
    exclude: ['@wallet-sdk']
  },
  server: {
    fs: {
      allow: ['.', './lib/wallet-sdk']
    }
  },
  base: './'
})
