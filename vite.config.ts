import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import type { ClientRequest } from 'http'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

function createApiProxy(env: Record<string, string>): Record<string, ProxyOptions> {
  const apiKey = env.DASHSCOPE_API_KEY || '';
  const workspaceId = env.DASHSCOPE_WORKSPACE_ID || '';
  const base = workspaceId
    ? `https://${workspaceId}.cn-beijing.maas.aliyuncs.com`
    : 'https://placeholder.cn-beijing.maas.aliyuncs.com';

  const injectAuth = (proxy: { on: (event: string, listener: (...args: unknown[]) => void) => void }) => {
    proxy.on('proxyReq', (proxyReq: unknown) => {
      const req = proxyReq as ClientRequest & { removeHeader?: (name: string) => void };
      req.removeHeader?.('authorization');
      if (apiKey) {
        req.setHeader('Authorization', `Bearer ${apiKey}`);
      }
    });
  };

  return {
    '/dashscope': {
      target: base,
      changeOrigin: true,
      configure: injectAuth,
      rewrite: (path) =>
        path.replace(/^\/dashscope/, '/api/v1/services/aigc/multimodal-generation/generation'),
    },
    '/qwen-chat': {
      target: base,
      changeOrigin: true,
      configure: injectAuth,
      rewrite: (path) =>
        path.replace(/^\/qwen-chat/, '/compatible-mode/v1/chat/completions'),
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      sourcemap: 'hidden',
    },
    server: {
      proxy: createApiProxy(env),
    },
    preview: {
      proxy: createApiProxy(env),
    },
    plugins: [
      react({
        babel: {
          plugins: [
            'react-dev-locator',
          ],
        },
      }),
      traeBadgePlugin({
        variant: 'dark',
        position: 'bottom-right',
        prodOnly: true,
        clickable: true,
        clickUrl: 'https://www.trae.ai/solo?showJoin=1',
        autoTheme: true,
        autoThemeTarget: '#root'
      }), 
      tsconfigPaths()
    ],
  }
})
