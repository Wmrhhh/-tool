import { useState } from 'react';

interface ImageGeneratorProps {
  placeholder?: string;
  prompt?: string;
  showInput?: boolean;
  showCard?: boolean;
  className?: string;
  disabled?: boolean;
  disabledHint?: string;
  onImageGenerated?: (url: string) => void;
  imageUrl?: string;
  strength?: number;
  size?: string;
}

export default function ImageGenerator({ placeholder, prompt: externalPrompt, showInput = true, showCard = true, className = '', disabled = false, disabledHint = '', onImageGenerated, imageUrl, strength = 0.5, size }: ImageGeneratorProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const currentPrompt = externalPrompt !== undefined ? externalPrompt : inputValue.trim();

  const handleGenerate = async () => {
    if (!currentPrompt) {
      setError('请输入内容');
      return;
    }

    setIsLoading(true);
    setGeneratedImageUrl(null);
    setError(null);
    setDownloadError(null);

    try {
      const content: Array<{ text?: string; image?: string }> = [{ text: currentPrompt }];
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
            size: size || '2K',
            n: 1,
            watermark: false,
            thinking_mode: true,
            ...(imageUrl ? { ref_strength: strength } : {}),
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('API 错误响应状态:', response.status);
        console.error('API 错误响应内容:', errorText);
        let errorData = null;
        try { errorData = JSON.parse(errorText); } catch { /* ignore parse error */ }
        throw new Error(errorData?.error?.message || `请求失败: ${response.status}`);
      }

      const rsp = await response.json();
      const rawImage = rsp?.output?.choices?.[0]?.message?.content?.find(
        (c: { type: string; image?: string }) => c.type === 'image'
      )?.image;
      // 去除可能存在的反引号包裹
      const generatedUrl = rawImage?.replace(/^`|`$/g, '');
      if (generatedUrl) {
        setGeneratedImageUrl(generatedUrl);
        onImageGenerated?.(generatedUrl);
        
        const history = JSON.parse(localStorage.getItem('imageHistory') || '[]');
        const newItem = {
          id: Date.now().toString(),
          url: generatedUrl,
          prompt: currentPrompt,
          timestamp: Date.now(),
        };
        try {
          localStorage.setItem('imageHistory', JSON.stringify([newItem, ...history]));
          window.dispatchEvent(new Event('historyUpdated'));
        } catch (storageErr) {
          console.warn('历史记录保存失败，可能是存储空间不足:', storageErr);
          // 尝试只保留最近20条
          try {
            const trimmedHistory = history.slice(0, 19);
            localStorage.setItem('imageHistory', JSON.stringify([newItem, ...trimmedHistory]));
            window.dispatchEvent(new Event('historyUpdated'));
          } catch (e) {
            console.error('无法保存历史记录:', e);
          }
        }
      } else {
        throw new Error('返回数据格式错误');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) return;
    setDownloadError(null);
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date();
      const filename = `edtech-image-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}.png`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError('下载失败，请重试');
    }
  };

  return (
    <div className={`mt-12 w-full max-w-2xl ${className}`}>
      <div className={showCard ? 'bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6' : ''}>
        {showInput && (
          <>
            <textarea
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 resize-none"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <div className="mt-4 flex justify-center">
              <button
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                onClick={handleGenerate}
              >
                生成图片
              </button>
            </div>
          </>
        )}
        {!showInput && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <button
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGenerate}
              disabled={isLoading || !currentPrompt || disabled}
            >
              {isLoading ? '生成中...' : '生成图片'}
            </button>
            {disabled && disabledHint && (
              <p className="text-sm text-white/50">{disabledHint}</p>
            )}
          </div>
        )}
        {isLoading && (
          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 text-white mb-3">
              <svg className="animate-spin h-5 w-5 text-purple-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>正在生成中，预计需要10-20秒...</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full progress-bar" />
            </div>
          </div>
        )}
        {error && (
          <div className="mt-6 flex justify-center">
            <div className="text-red-400 bg-red-500/10 px-4 py-2 rounded-lg">
              {error}
            </div>
          </div>
        )}
        {generatedImageUrl && !isLoading && !error && (
          <div className="mt-6 flex flex-col items-center">
            <img
              src={generatedImageUrl}
              alt="生成的图片"
              className="rounded-xl shadow-xl max-w-full"
            />
            <button
              className="mt-4 px-6 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
              onClick={handleDownload}
            >
              下载图片
            </button>
            {downloadError && (
              <div className="mt-3 text-red-400 text-sm">
                {downloadError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
