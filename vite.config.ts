import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const workspaceId = env.VITE_DASHSCOPE_WORKSPACE_ID || 'your-workspace-id';
  console.log('[vite.config] workspaceId:', workspaceId);

  return {
    build: {
      sourcemap: 'hidden',
    },
    server: {
      proxy: {
        '/dashscope': {
          target: `https://${workspaceId}.cn-beijing.maas.aliyuncs.com`,
          changeOrigin: true,
          rewrite: (path) => {
            const newPath = path.replace(/^\/dashscope/, '/api/v1/services/aigc/multimodal-generation/generation');
            console.log('[vite proxy] rewrite:', path, '->', newPath);
            console.log('[vite proxy] target:', `https://${workspaceId}.cn-beijing.maas.aliyuncs.com`);
            return newPath;
          },
        },
        '/qwen-chat': {
          target: 'https://ws-n7t7hctva4zeim4t.cn-beijing.maas.aliyuncs.com',
          changeOrigin: true,
          rewrite: (path) => {
            const newPath = path.replace(/^\/qwen-chat/, '/compatible-mode/v1/chat/completions');
            console.log('[vite proxy] qwen rewrite:', path, '->', newPath);
            return newPath;
          },
        },
      },
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
