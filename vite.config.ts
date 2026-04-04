import { defineConfig, loadEnv, type PluginOption } from 'vite'
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
  // Загружаем переменные из .env, .env.local и mode-специфичных env-файлов
  const env = loadEnv(mode, process.cwd(), '')

  // Извлекаем origin из VITE_API_URL для прокси (без пути /api/v1/)
  let proxyTarget = 'http://127.0.0.1:8001'
  try {
    if (env.VITE_API_URL) {
      proxyTarget = new URL(env.VITE_API_URL).origin
    }
  } catch {
    console.warn('[vite] Invalid VITE_API_URL, using default proxy target:', proxyTarget)
  }

  console.log(`[vite] Proxy /api/v1 → ${proxyTarget} (from VITE_API_URL=${env.VITE_API_URL})`)

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
          target: proxyTarget,
          changeOrigin: true,
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
