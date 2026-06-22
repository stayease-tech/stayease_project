import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Frontend route prefixes — these should NOT be proxied to Django.
// e.g. /accounts/dashboard, /accounts/accounts-vendor-table
const frontendRoutes = [
  'dashboard',
  'accounts-', 'operations-', 'sales-', 'supply-', 'partners-',
  'user-activity',
];

// Backend API path prefixes (second URL segment) that must always be proxied,
// even if they also match a frontendRoutes prefix above.
// e.g. /accounts/accounts-form-update/1/ must reach Django, not the SPA.
const backendApiPaths = [
  'accounts-form-',
  'accounts-fixed-expense-',
];

/** Only proxy to Django if the path looks like an API call, not a frontend route */
function shouldProxy(pathname, modulePrefix) {
  // These prefixes are backend-only and should never be treated as SPA routes.
  if (modulePrefix === '/api' || modulePrefix === '/resident-portal' || modulePrefix === '/media') {
    return true;
  }

  const secondSegment = pathname.split('/').filter(Boolean)[1] || '';

  // Always proxy known backend API paths, regardless of frontendRoutes.
  if (backendApiPaths.some((prefix) => secondSegment.startsWith(prefix))) {
    return true;
  }

  return !frontendRoutes.some((prefix) => secondSegment.startsWith(prefix));
}

const modules = ['/accounts', '/operations', '/sales', '/supply', '/partners', '/contract', '/resident-details', '/resident-portal', '/api', '/media'];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const djangoPort = env.DJANGO_PORT || '8001';
  const djangoTarget = `http://127.0.0.1:${djangoPort}`;

  const proxy = {};
  for (const mod of modules) {
    proxy[mod] = {
      target: djangoTarget,
      bypass(req) {
        if (!shouldProxy(req.url, mod)) return req.url; // serve from Vite (SPA)
      },
    };
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy,
      host: true,  // Expose on local network (0.0.0.0) for iPhone testing
    },
    build: {
      outDir: 'build',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      css: false,
    },
  };
})
