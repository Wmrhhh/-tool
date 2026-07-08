import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface IntentChatProps {
  onOptimized: (intent: string) => void;
}

const SYSTEM_PROMPT = `你是教培行业营销专家，擅长帮助运营人员把模糊需求转化为精准的AI配图提示词。

通过简短对话（最多3轮对话，即你最多回复3次），通过询问关键信息来完善用户的意图，最后输出一段详细的优化意图描述，用于AI文生图。

你需要了解的关键信息：
- 目标人群（年龄段、家长画像等）
- 核心痛点或用户需求
- 产品卖点或差异化优势
- 情绪基调（温暖/紧迫/专业/活泼等）
- 使用场景（朋友圈/海报/公众号封面等）

对话规则：
1. 第1次回复：先肯定用户的想法，然后提1-2个最关键的问题
2. 第2次回复：根据用户回答，补充追问或总结确认
3. 第3次回复：直接输出最终的优化意图描述，以"✨ 已为您生成优化意图："开头

输出的优化意图描述格式要求：
- 包含：画面内容、文字风格、色调氛围、构图要求
- 详细具体，适合直接用作AI文生图的提示词
- 用中文，不要分点，写成一段连贯的描述

注意：每次回复要简洁，不要长篇大论。如果用户的初始意图已经很完整，可以直接给出优化意图。`;

export default function IntentChat({ onOptimized }: IntentChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasOptimized, setHasOptimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const startChat = () => {
    setIsOpen(true);
    setMessages([]);
    setHasOptimized(false);
    setInputValue('');
  };

  const resetChat = () => {
    setMessages([]);
    setHasOptimized(false);
    setInputValue('');
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: inputValue.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiMessages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...newMessages,
      ];

      const response = await fetch('/qwen-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen3.7-plus',
          messages: apiMessages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`对话失败: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content || '';

      if (reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);

        // 检测是否为最终优化意图
        if (reply.includes('✨ 已为您生成优化意图') || reply.includes('优化意图') || newMessages.length >= 5) {
          setHasOptimized(true);
          // 提取意图文本
          let optimized = reply;
          const prefixPattern = /^.*?已为您生成优化意图[：: ]*\n*/;
          optimized = optimized.replace(prefixPattern, '').trim();
          // 去除可能的引号
          optimized = optimized.replace(/^["「『]|["」』]$/g, '').trim();
          if (optimized) {
            onOptimized(optimized);
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: err instanceof Error ? err.message : '对话失败，请重试' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="flex justify-center">
        <button
          onClick={startChat}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          <span>🤖</span>
          <span>AI帮我完善意图</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="text-white font-medium text-sm">AI 意图优化助手</span>
        </div>
        <div className="flex items-center gap-2">
          {hasOptimized && (
            <button
              onClick={resetChat}
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              重新对话
            </button>
          )}
          <button
            onClick={closeChat}
            className="text-white/40 hover:text-white transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="max-h-80 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-white/40 text-sm py-8">
            说说你想做什么样的配图？<br />我来帮你完善意图描述
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-sm shrink-0">
                🤖
              </div>
            )}
            <div
              className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                msg.role === 'user'
                  ? 'bg-purple-500/30 text-white rounded-br-sm'
                  : 'bg-white/10 text-white/90 rounded-bl-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm shrink-0">
                👤
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-sm shrink-0">
              🤖
            </div>
            <div className="bg-white/10 px-3 py-2 rounded-xl rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasOptimized ? '可以继续补充，或直接使用上方优化结果' : '输入你的想法...'}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
