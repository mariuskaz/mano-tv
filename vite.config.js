import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const proxyPlugin = () => ({
  name: 'local-proxy',
  configureServer(server) {
    server.middlewares.use('/api/proxy', async (req, res, next) => {
      const requestUrl = new URL(req.url || '/', 'http://localhost');
      const targetUrl = requestUrl.searchParams.get('url');

      if (!targetUrl) {
        res.statusCode = 400;
        res.end('Missing url');
        return;
      }

      try {
        const response = await fetch(targetUrl);
        const body = await response.text();
        res.statusCode = response.status;
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', response.headers.get('content-type') || 'text/plain');
        res.end(body);
      } catch (error) {
        console.error('Proxy error:', error);
        res.statusCode = 502;
        res.end('Proxy request failed');
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), proxyPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
