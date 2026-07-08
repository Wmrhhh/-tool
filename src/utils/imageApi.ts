export interface GenerateImageOptions {
  prompt: string;
  imageUrl?: string;
  strength?: number;
  size?: string;
  signal?: AbortSignal;
}

export async function generateImage(options: GenerateImageOptions): Promise<string> {
  const { prompt, imageUrl, strength = 0.5, size = '2K', signal } = options;

  const content: Array<{ text?: string; image?: string }> = [{ text: prompt }];
  if (imageUrl) {
    content.unshift({ image: imageUrl });
  }

  const response = await fetch('/dashscope', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'wan2.7-image-pro',
      input: {
        messages: [
          {
            role: 'user',
            content,
          }
        ],
      },
      parameters: {
        size,
        n: 1,
        watermark: false,
        thinking_mode: true,
        ...(imageUrl ? { ref_strength: strength } : {}),
      },
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let errorData = null;
    try { errorData = JSON.parse(errorText); } catch { /* ignore */ }
    throw new Error(errorData?.error?.message || `请求失败: ${response.status}`);
  }

  const rsp = await response.json();
  const rawImage = rsp?.output?.choices?.[0]?.message?.content?.find(
    (c: { type: string; image?: string }) => c.type === 'image'
  )?.image;

  const generatedUrl = rawImage?.replace(/^`|`$/g, '');
  if (!generatedUrl) {
    throw new Error('返回数据格式错误');
  }

  return generatedUrl;
}

export function saveImageToHistory(url: string, prompt: string) {
  const history = JSON.parse(localStorage.getItem('imageHistory') || '[]');
  const newItem = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    url,
    prompt,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem('imageHistory', JSON.stringify([newItem, ...history]));
    window.dispatchEvent(new Event('historyUpdated'));
  } catch (storageErr) {
    console.warn('历史记录保存失败:', storageErr);
    try {
      const trimmedHistory = history.slice(0, 19);
      localStorage.setItem('imageHistory', JSON.stringify([newItem, ...trimmedHistory]));
      window.dispatchEvent(new Event('historyUpdated'));
    } catch (e) {
      console.error('无法保存历史记录:', e);
    }
  }
}

export async function downloadImage(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}
