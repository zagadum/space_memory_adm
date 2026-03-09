import { defineConfig, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const copyHtaccessPlugin: PluginOption = {
  name: 'copy-htaccess',
  closeBundle() {
    try {
      fs.copyFileSync(
        path.resolve(__dirname, 'public/.htaccess'),
        path.resolve(__dirname, 'dist/.htaccess')
      )
      console.log('.htaccess copied to dist/')
    } catch (err) {
      console.warn('Failed to copy .htaccess:', err)
    }
  }
}

function manualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined

  if (id.includes('vue-router') || id.includes('pinia')) return 'vendor-router-pinia'
  if (id.includes('vue-i18n')) return 'vendor-i18n'
  if (id.includes('axios')) return 'vendor-axios'

  return 'vendor'
}

export default defineConfig(async ({ mode }) => {
  const plugins: PluginOption[] = [vue(), copyHtaccessPlugin]

  if (mode === 'analyze') {
    try {
      const { visualizer } = await import('rollup-plugin-visualizer')
      plugins.push(
        visualizer({
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
          open: false,
          template: 'treemap'
        })
      )
    } catch {
      console.warn('[vite] analyze mode: rollup-plugin-visualizer is not installed, skipping stats report')
    }
  }

  return {
    plugins,
    server: {
      port: 5173,
      proxy: {
        '/api/v1': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1') // no change needed if backend expects /api/v1
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks
        }
      }
    },
    publicDir: 'public'
  }
})
