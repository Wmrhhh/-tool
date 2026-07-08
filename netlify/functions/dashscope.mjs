import { proxyToDashScope } from './lib/proxy.mjs';

const TARGET_PATH = '/api/v1/services/aigc/multimodal-generation/generation';

export default async (request) => {
  return proxyToDashScope(request, TARGET_PATH);
};
