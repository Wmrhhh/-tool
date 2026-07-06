import { useState, useEffect, useCallback } from 'react';
import { generateImage, saveImageToHistory, downloadImage } from '@/utils/imageApi';

export type VisualStyle = 'design' | 'infographic' | 'knowledge' | 'metaphor';

interface BatchImageItem {
  style: VisualStyle;
  label: string;
  promptSuffix: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  url: string | null;
  error: string | null;
}

interface BatchImageGridProps {
  basePrompt: string;
  size?: string;
  disabled?: boolean;
}

const STYLE_CONFIG: Omit<BatchImageItem, 'status' | 'url' | 'error'>[] = [
  {
    style: 'design',
    label: '设计感',
    promptSuffix: '，场景插画风格，情感氛围渲染，温暖色调，专业教育海报',
  },
  {
    style: 'infographic',
    label: '信息图',
    promptSuffix: '，数据可视化风格，图表元素，对比信息，清晰结构',
  },
  {
    style: 'knowledge',
    label: '知识点形',
    promptSuffix: '，教育干货风格，知识点图解，原理示意图，信息分层',
  },
  {
    style: 'metaphor',
    label: '隐喻形',
    promptSuffix: '，象征隐喻风格，对比构图，情绪冲击，视觉张力',
  },
];

function createInitialItems(): BatchImageItem[] {
  return STYLE_CONFIG.map((cfg) => ({
    ...cfg,
    status: 'idle',
    url: null,
    error: null,
  }));
}

export default function BatchImageGrid({ basePrompt, size = '2K', disabled = false }: BatchImageGridProps) {
  const [items, setItems] = useState<BatchImageItem[]>(createInitialItems);

  const hasStarted = items.some((item) => item.status !== 'idle');

  const generateOne = useCallback(async (index: number) => {
    const item = items[index];
    const fullPrompt = basePrompt + item.promptSuffix;

    setItems((prev) => prev.map((it, i) => i === index ? { ...it, status: 'loading', error: null, url: null } : it));

    try {
      const url = await generateImage({ prompt: fullPrompt, size });
      saveImageToHistory(url, `[批量-${item.label}] ${basePrompt}`);
      setItems((prev) => prev.map((it, i) => i === index ? { ...it, status: 'success', url } : it));
    } catch (err) {
      setItems((prev) => prev.map((it, i) => i === index ? { ...it, status: 'error', error: err instanceof Error ? err.message : '生成失败' } : it));
    }
  }, [basePrompt, items, size]);

  const startBatch = useCallback(() => {
    if (!basePrompt.trim() || disabled) return;
    setItems(createInitialItems());
    setTimeout(() => {
      STYLE_CONFIG.forEach((_, i) => {
        generateOne(i);
      });
    }, 50);
  }, [basePrompt, disabled, generateOne]);

  const regenerateOne = useCallback((index: number) => {
    generateOne(index);
  }, [generateOne]);

  const handleDownload = useCallback(async (item: BatchImageItem) => {
    if (!item.url) return;
    try {
      const now = new Date();
      const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      await downloadImage(item.url, `${item.label}-${ts}.png`);
    } catch {
      console.error('下载失败');
    }
  }, []);

  useEffect(() => {
    setItems(createInitialItems());
  }, [basePrompt]);

  return (
    <div className="mt-6">
      {!hasStarted && (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={startBatch}
            disabled={disabled || !basePrompt.trim()}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            批量生成 4 种风格
          </button>
          {disabled && (
            <p className="text-sm text-white/50">请先填写意图描述</p>
          )}
        </div>
      )}

      {hasStarted && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">
              批量生成 <span className="text-white/50 text-sm">（{items.filter(i => i.status === 'success').length}/4）</span>
            </h4>
            <button
              onClick={startBatch}
              disabled={!basePrompt.trim()}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              重新生成全部
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item, index) => (
              <div
                key={item.style}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              >
                <div className="aspect-video bg-black/20 flex items-center justify-center relative">
                  {item.status === 'loading' && (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin h-8 w-8 text-purple-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-white/60 text-sm">{item.label}生成中...</span>
                    </div>
                  )}

                  {item.status === 'error' && (
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                      <span className="text-red-400 text-sm">{item.error || '生成失败'}</span>
                      <button
                        onClick={() => regenerateOne(index)}
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        点击重试
                      </button>
                    </div>
                  )}

                  {item.status === 'success' && item.url && (
                    <img
                      src={item.url}
                      alt={item.label}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-white/80 text-sm font-medium">{item.label}</span>
                  {item.status === 'success' && item.url && (
                    <button
                      onClick={() => handleDownload(item)}
                      className="text-xs text-white/60 hover:text-white transition-colors px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                    >
                      下载
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
