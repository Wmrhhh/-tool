import { proxyToDashScope } from './lib/proxy.mjs';

const TARGET_PATH = '/compatible-mode/v1/chat/completions';

export default async (request) => {
  return proxyToDashScope(request, TARGET_PATH);
};
