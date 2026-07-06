import { useState, useEffect } from 'react';
import IntentChat from './IntentChat';

export type MarketingStage = 'acquisition' | 'retention' | 'inquiry' | 'shaping' | 'spread' | 'decision';
export type VisualStyle = 'design' | 'infographic' | 'knowledge' | 'metaphor';
export type ImageSize = '1:1' | '16:9' | '9:16' | '3:4';

export interface MarketingFormValues {
  intent: string;
  stage: MarketingStage;
  visualStyle: VisualStyle;
  imageSize: ImageSize;
  productName: string;
  coreData: string;
  brandName: string;
}

interface WorkbenchFormProps {
  onValuesChange: (values: MarketingFormValues) => void;
}

const stageOptions: { value: MarketingStage; label: string; desc: string }[] = [
  { value: 'acquisition', label: '招新', desc: '吸引新客户，突出痛点和解决方案' },
  { value: 'retention', label: '留存', desc: '展示效果数据，增强信任和续报' },
  { value: 'inquiry', label: '询问需求', desc: '引发思考，收集潜在需求' },
  { value: 'shaping', label: '塑造孩子', desc: '情感故事，塑造品牌温度' },
  { value: 'spread', label: '传播', desc: '话题性内容，促进转发传播' },
  { value: 'decision', label: '决策', desc: '营造稀缺感，促进行动转化' },
];

const styleOptions: { value: VisualStyle; label: string; desc: string }[] = [
  { value: 'design', label: '设计感', desc: '极简艺术构图，优雅有格调' },
  { value: 'infographic', label: '信息图', desc: '数据可视化风格，图表元素' },
  { value: 'knowledge', label: '知识点形', desc: '教育卡片风格，学习主题' },
  { value: 'metaphor', label: '隐喻形', desc: '左右对比，前后反差呈现' },
];

const sizeOptions: { value: ImageSize; label: string; desc: string }[] = [
  { value: '1:1', label: '1:1 正方形', desc: '朋友圈、头像、商品图' },
  { value: '16:9', label: '16:9 横屏', desc: '公众号封面、Banner、PPT' },
  { value: '9:16', label: '9:16 竖屏', desc: '小红书、抖音、海报' },
  { value: '3:4', label: '3:4 竖屏', desc: '小红书笔记、商品详情' },
];

export default function WorkbenchForm({ onValuesChange }: WorkbenchFormProps) {
  const [intent, setIntent] = useState('');
  const [stage, setStage] = useState<MarketingStage>('acquisition');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('design');
  const [imageSize, setImageSize] = useState<ImageSize>('16:9');
  const [productName, setProductName] = useState('');
  const [coreData, setCoreData] = useState('');
  const [brandName, setBrandName] = useState('');

  useEffect(() => {
    onValuesChange({ intent, stage, visualStyle, imageSize, productName, coreData, brandName });
  }, [intent, stage, visualStyle, imageSize, productName, coreData, brandName, onValuesChange]);

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">意图描述</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/60 mb-2">这张图要干什么？给谁看？想达到什么效果？<span className="text-purple-400"> *</span></label>
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="例如：让家长意识到大班课孩子没人管，突出我们小班的优势"
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 resize-none"
          />
        </div>
        <IntentChat onOptimized={(text) => setIntent(text)} />
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">辅助选项</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">营销阶段</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as MarketingStage)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400/50 appearance-none cursor-pointer"
            >
              {stageOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#1e1b4b] text-white">
                  {opt.label} — {opt.desc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">视觉风格</label>
            <select
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value as VisualStyle)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400/50 appearance-none cursor-pointer"
            >
              {styleOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#1e1b4b] text-white">
                  {opt.label} — {opt.desc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">图片尺寸</label>
            <select
              value={imageSize}
              onChange={(e) => setImageSize(e.target.value as ImageSize)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400/50 appearance-none cursor-pointer"
            >
              {sizeOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#1e1b4b] text-white">
                  {opt.label} — {opt.desc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">关键变量（可选）</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">课程/产品名称</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="例如：少儿编程"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">核心数据</label>
            <input
              type="text"
              value={coreData}
              onChange={(e) => setCoreData(e.target.value)}
              placeholder="例如：12-15人、5次点名、3个月"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">品牌名</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="例如：小思小班"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
