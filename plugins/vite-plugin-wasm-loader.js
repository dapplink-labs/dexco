import fs from 'fs'
import path from 'path'

export default function wasmLoader() {
  const wasmFiles = new Map()
  
  return {
    name: 'vite-plugin-wasm-loader',
    
    load(id) {
      if (id.endsWith('.wasm')) {
        const content = fs.readFileSync(id)
        const base64 = content.toString('base64')
        wasmFiles.set(id, base64)
        
        return `
          const wasmBase64 = "${base64}";
          const wasmBinary = Uint8Array.from(atob(wasmBase64), c => c.charCodeAt(0));
          
          const initWasm = async function(imports = {}) {
            const wasmModule = await WebAssembly.instantiate(wasmBinary, imports);
            return wasmModule.instance.exports;
          };

          if (typeof exports === 'object' && typeof module !== 'undefined') {
            module.exports = initWasm;
          } else if (typeof define === 'function' && define.amd) {
            define([], function() { return initWasm; });
          } else {
            (typeof window !== "undefined" ? window : global).initWasm = initWasm;
          }
        `
      }
    },
    
    transform(code, id) {
      if (code.includes('import.meta') && code.includes('.wasm')) {
        return code.replace(
          /const\s+__vite__wasmUrl\s*=\s*""\s*\+\s*new\s+URL\([^)]+\)\.href/g,
          'const __vite__wasmUrl = ""'
        )
      }
    },

    generateBundle(options, bundle) {
      for (const [wasmPath, base64] of wasmFiles) {
        const fileName = path.basename(wasmPath)
        this.emitFile({
          type: 'asset',
          fileName,
          source: Buffer.from(base64, 'base64')
        })
      }
    }
  }
} 