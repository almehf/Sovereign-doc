import basePlugin from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode ?? 'development', process.cwd(), '')
  const appBaseUrl = env.VITE_BASE_APP_BASE_URL

  return {
    logLevel: 'error', // Suppress warnings, only show errors
    plugins: [
      basePlugin({
        // Support for legacy code that imports the SDK with @/integrations, @/entities, etc.
        // can be removed if the code has been updated to use the new SDK imports from @base/sdk
        legacySDKImports: process.env.BASE_LEGACY_SDK_IMPORTS === 'true',
        hmrNotifier: true,
        navigationNotifier: true,
        analyticsTracker: true,
        visualEditAgent: true
      }),
      react(),
    ],
    ...(appBaseUrl
      ? {
          server: {
            proxy: {
              '/api': {
                target: appBaseUrl,
                changeOrigin: true,
              },
            },
          },
        }
      : {}),
  }
});
