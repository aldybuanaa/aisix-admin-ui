import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:3001'
  const adminApiKey = env.VITE_ADMIN_API_KEY || ''

  const proxyHeaders: Record<string, string> = {}
  if (adminApiKey) {
    proxyHeaders['x-admin-key'] = adminApiKey
    proxyHeaders['Authorization'] = `Bearer ${adminApiKey}`
  }

  return {
    plugins: [tailwindcss(), vue()],
    resolve: {
      alias: {
        '@': import.meta.dirname + '/src',
      },
    },
    server: {
      proxy: {
        '/admin': {
          target: proxyTarget,
          changeOrigin: true,
          headers: proxyHeaders,
        },
        '/livez': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/readyz': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
