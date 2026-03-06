import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-htaccess',
      // @ts-expect-error - Vite plugin hook
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
  ],
  server: { port: 5173 },
  publicDir: 'public'
})
