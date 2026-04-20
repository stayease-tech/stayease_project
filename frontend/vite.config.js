import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Frontend route prefixes — these should NOT be proxied to Django.
// e.g. /accounts/dashboard, /accounts/accounts-vendor-table
const frontendRoutes = [
  'dashboard',
  'accounts-', 'operations-', 'sales-', 'supply-', 'partners-', 'tenant-',
  'user-activity',
];

/** Only proxy to Django if the path looks like an API call, not a frontend route */
function shouldProxy(pathname) {
  const secondSegment = pathname.split('/').filter(Boolean)[1] || '';
  return !frontendRoutes.some((prefix) => secondSegment.startsWith(prefix));
}

const djangoTarget = 'http://127.0.0.1:8000';
const modules = ['/accounts', '/operations', '/sales', '/supply', '/partners', '/contract', '/tenant-details', '/tenant-portal', '/api'];
const proxy = {};
for (const mod of modules) {
  proxy[mod] = {
    target: djangoTarget,
    bypass(req) {
      if (!shouldProxy(req.url)) return req.url; // serve from Vite (SPA)
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy,
    host: true,  // Expose on local network (0.0.0.0) for iPhone testing
  },
  build: {
    outDir: 'build',
  },
})
