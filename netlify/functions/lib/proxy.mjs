/**
 * Shared proxy helper for DashScope API routes.
 * API key is read from server-side env only — never exposed to the browser.
 */
export async function proxyToDashScope(request, targetPath) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const workspaceId = process.env.DASHSCOPE_WORKSPACE_ID;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: '服务端未配置 DASHSCOPE_API_KEY' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!workspaceId) {
    return new Response(
      JSON.stringify({ error: { message: '服务端未配置 DASHSCOPE_WORKSPACE_ID' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: { message: 'Method not allowed' } }),
      { status: 405, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const targetUrl = `https://${workspaceId}.cn-beijing.maas.aliyuncs.com${targetPath}`;
  const body = await request.text();

  const upstream = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: body || undefined,
  });

  const responseText = await upstream.text();

  return new Response(responseText, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
    },
  });
}
