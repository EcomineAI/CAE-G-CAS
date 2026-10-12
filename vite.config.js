import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'child_process'

let commitDate = new Date().toISOString();
let commitHash = 'dev';

try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim();
  commitDate = execSync('git log -1 --format=%cI').toString().trim();
} catch {
  // not in a git repo or git unavailable — fall back to current time
}

export default defineConfig(() => ({
  define: {
    __BUILD_TIME__: JSON.stringify(commitDate),
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      manifest: false,
    }),
  ],
  server: {
    allowedHosts: [".trycloudflare.com"]
  }
}))
