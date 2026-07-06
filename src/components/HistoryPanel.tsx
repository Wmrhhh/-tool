import { useState, useEffect } from 'react';

interface HistoryItem {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export default function HistoryPanel() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadHistory = () => {
    const saved = localStorage.getItem('imageHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  };

  useEffect(() => {
    loadHistory();
    const handleHistoryUpdate = () => loadHistory();
    window.addEventListener('historyUpdated', handleHistoryUpdate);
    window.addEventListener('storage', handleHistoryUpdate);
    return () => {
      window.removeEventListener('historyUpdated', handleHistoryUpdate);
      window.removeEventListener('storage', handleHistoryUpdate);
    };
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncatePrompt = (prompt: string) => {
    return prompt.length > 20 ? prompt.slice(0, 20) + '...' : prompt;
  };

  const handleClearHistory = () => {
    setHistory([]);
    setSelectedImage(null);
    localStorage.removeItem('imageHistory');
  };

  return (
    <>
      <div className="mt-12 w-full max-w-2xl">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">历史记录</h3>
            {history.length > 0 && (
              <button
                className="text-sm text-white/60 hover:text-red-400 transition-colors"
                onClick={handleClearHistory}
              >
                清空历史
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">暂无历史记录</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="group relative cursor-pointer"
                  onClick={() => setSelectedImage(item.url)}
                >
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="w-full aspect-square object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end p-2">
                    <div className="text-white text-xs truncate w-full">
                      {truncatePrompt(item.prompt)}
                    </div>
                  </div>
                  <div className="text-white/40 text-xs mt-1 text-center">
                    {formatTime(item.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="预览"
            className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
