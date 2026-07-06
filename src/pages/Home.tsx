import { useState, useEffect, useCallback, useMemo } from 'react';
import ImageGenerator from '@/components/ImageGenerator';
import HistoryPanel from '@/components/HistoryPanel';
import Navbar from '@/components/Navbar';
import WorkbenchForm from '@/components/WorkbenchForm';
import type { MarketingFormValues, MarketingStage, VisualStyle } from '@/components/WorkbenchForm';
import PromotionForm from '@/components/PromotionForm';
import type { PromotionFormValues } from '@/components/PromotionForm';
import EnhanceForm from '@/components/EnhanceForm';
import type { EnhanceFormValues } from '@/components/EnhanceForm';
import BatchImageGrid from '@/components/BatchImageGrid';

type Page = 'home' | 'workbench' | 'promotion' | 'enhance';

const cards = [
  {
    icon: '✨',
    title: '意图驱动配图生成器',
    desc: '描述你的营销意图，AI自动生成符合意图的配图，支持招新、留存等多种营销阶段和视觉风格。',
    placeholder: '请描述你想要的图片意图...',
  },
  {
    icon: '🎨',
    title: '推广物料',
    desc: '设计精美的招生海报、活动宣传图、节日祝福等推广物料，助力学校品牌形象提升。',
    placeholder: '请输入课程名称、优惠价格、活动时间...',
  },
  {
    icon: '✨',
    title: '智能美化',
    desc: '上传照片，描述美化意图，AI智能调整色彩、风格和构图，让图片焕发新光彩。',
  },
];

function HomePage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  const handleCardClick = (index: number) => {
    if (index === 0) {
      window.dispatchEvent(new Event('navigateToWorkbench'));
      return;
    }
    if (index === 1) {
      window.dispatchEvent(new Event('navigateToPromotion'));
      return;
    }
    if (index === 2) {
      window.dispatchEvent(new Event('navigateToEnhance'));
      return;
    }
    setSelectedCardIndex(selectedCardIndex === index ? null : index);
  };

  return (
    <div className="relative z-10 text-center max-w-5xl w-full">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-[0.2em] drop-shadow-[0_0_30px_rgba(180,100,255,0.5)] animate-fade-in-down">
          老师的出图助手
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-3 animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
          AI驱动的专业配图设计
        </p>
        <p className="text-white/50 animate-fade-in-down" style={{ animationDelay: '0.4s' }}>
          选择你今天要做的场景，开始创作
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 ${
              hoveredIndex === index ? 'border-purple-500/30' : ''
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleCardClick(index)}
          >
            <div className="text-5xl mb-4 animate-fade-in-up">{card.icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{card.title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{card.desc}</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </div>
        ))}
      </div>

      <HistoryPanel />
    </div>
  );
}

function WorkbenchPage({ onBack }: { onBack: () => void }) {
  const [formValues, setFormValues] = useState<MarketingFormValues>({
    intent: '',
    stage: 'acquisition',
    visualStyle: 'design',
    imageSize: '16:9',
    productName: '',
    coreData: '',
    brandName: '',
  });
  const [genMode, setGenMode] = useState<'single' | 'batch'>('single');

  const hasIntent = formValues.intent.trim().length > 0;

  const generatePrompt = useMemo(() => {
    const intentText = formValues.intent.trim();
    if (!intentText) return '';

    const stageTypicalText: Record<MarketingStage, string> = {
      acquisition: '',
      retention: '',
      inquiry: '提问式文案，引发共鸣，让家长意识到问题，如"孩子学了就忘？问题出在哪？"',
      shaping: '前后对比，成长故事，情感激励，如"从不敢开口到主动举手"',
      spread: '社交证明，从众心理，真实推荐，如"5000+家长的选择"',
      decision: '稀缺性，紧迫感，行动号召，如"最后3天，立即锁定"',
    };

    const stageSceneMap: Record<MarketingStage, string> = {
      acquisition: '',
      retention: '',
      inquiry: '困惑场景，问号元素，思考氛围，家长焦虑或孩子迷茫的画面',
      shaping: '阳光向上，进步阶梯，孩子自信笑脸，成长时间线，蜕变过程',
      spread: '多人推荐场景，家长群像，口碑展示，信任传递，社交分享',
      decision: '倒计时元素，醒目CTA，爆炸贴标签，紧迫感氛围，限时提示',
    };

    const getStyleLayout = (stage: MarketingStage, style: VisualStyle): string => {
      if (stage === 'acquisition') {
        switch (style) {
          case 'design': return 'minimalist artistic layout, elegant composition, soft gradient background, visually appealing design';
          case 'infographic': return 'data visualization style, chart elements, progress bar textures, geometric shapes, clean infographic layout';
          case 'knowledge': return 'clean educational layout, note card elements, bullet point patterns, knowledge card style, learning theme';
          case 'metaphor': return 'split screen visual metaphor, left side showing problem, right side showing solution, strong visual contrast, before and after comparison';
        }
      }
      if (stage === 'retention') {
        switch (style) {
          case 'design': return 'minimalist artistic layout, elegant composition, soft gradient background, visually appealing design';
          case 'infographic': return 'data visualization style, chart elements, progress bar textures, geometric shapes, clean infographic layout';
          case 'knowledge': return 'clean educational layout, note card elements, bullet point patterns, knowledge card style, learning theme';
          case 'metaphor': return 'split screen visual metaphor, left side showing problem, right side showing solution, strong visual contrast, before and after comparison';
        }
      }
      if (stage === 'inquiry') {
        switch (style) {
          case 'design': return 'warm but slightly puzzled classroom scene, centered questioning large text, elegant minimalist composition';
          case 'infographic': return 'mistake checklist, common error statistics, comparison data, question mark icons, knowledge gap visualization';
          case 'knowledge': return 'educational principle analysis, forgetting curve, learning misconceptions, cognitive psychology diagrams, knowledge cards';
          case 'metaphor': return 'maze and clear path visual metaphor, fog before clarity, lost vs found, strong contrast composition';
        }
      }
      if (stage === 'shaping') {
        switch (style) {
          case 'design': return 'warm growth scene, before and after comparison small images, child confident smile, upward trend elements';
          case 'infographic': return 'ability radar chart, progress curve, skill tree, growth timeline, achievement milestones visualization';
          case 'knowledge': return 'growth stage theory, critical period education, ability development path, educational psychology principles';
          case 'metaphor': return 'cocoon to butterfly transformation, seed sprouting to tree, stepping stairs upward, before and after transformation';
        }
      }
      if (stage === 'spread') {
        switch (style) {
          case 'design': return 'warm parent communication scene, recommendation gestures, smiling crowd, social sharing atmosphere';
          case 'infographic': return 'recommendation data, satisfaction statistics, referral flow chart, social proof metrics, trust indicators';
          case 'knowledge': return 'educational consensus, expert recommendations, parent must-read tips, trust-building content, authority endorsement';
          case 'metaphor': return 'ripple effect, torch passing, stars connected, word of mouth spreading, network expansion visual';
        }
      }
      if (stage === 'decision') {
        switch (style) {
          case 'design': return 'focused central large text, spotlight beam effect, urgency atmosphere, bold attention-grabbing composition';
          case 'infographic': return 'price comparison chart, discount strength indicator, limited time progress bar, value analysis visualization';
          case 'knowledge': return 'education ROI analysis, long-term value comparison, opportunity cost, investment benefit assessment';
          case 'metaphor': return 'last train leaving, gate closing, opportunity window, limited seats, urgent deadline visual';
        }
      }
      return '';
    };

    const stageMoodMap: Record<MarketingStage, string> = {
      acquisition: 'problem-solution contrast, eye-catching and persuasive, highlight the advantage',
      retention: 'trustworthy and data-driven, reassuring and confident mood, show progress and achievement',
      inquiry: 'thought-provoking, question mark elements, curious atmosphere, stimulate thinking, make parents realize problems',
      shaping: 'warm emotional storytelling, heartwarming mood, growth theme, emotional connection, show transformation',
      spread: 'viral-worthy, shareable, trending and conversational, engaging content, social proof',
      decision: 'urgent and scarcity-driven, action-oriented, compelling, call to action, limited time',
    };

    const stageToneMap: Record<MarketingStage, string> = {
      acquisition: 'warm orange and teal tones',
      retention: 'blue and green trustworthy tones',
      inquiry: 'purple and blue thoughtful tones',
      shaping: 'warm pink and yellow emotional tones',
      spread: 'vibrant red and orange social tones',
      decision: 'bold red and orange urgent tones',
    };

    const style = getStyleLayout(formValues.stage, formValues.visualStyle);
    const mood = stageMoodMap[formValues.stage];
    const tone = stageToneMap[formValues.stage];
    const typicalText = stageTypicalText[formValues.stage];
    const scene = stageSceneMap[formValues.stage];
    const aspectRatio = `${formValues.imageSize} aspect ratio`;
    const fixed = 'complete marketing poster with text and visuals integrated, flat illustration, clear legible Chinese text, professional layout';
    const quality = 'high quality, detailed, professional, education marketing';

    const keyVariables: string[] = [];
    if (formValues.productName) keyVariables.push(`product: ${formValues.productName}`);
    if (formValues.coreData) keyVariables.push(`data: ${formValues.coreData}`);
    if (formValues.brandName) keyVariables.push(`brand: ${formValues.brandName}`);

    const promptParts: string[] = [
      'education marketing poster',
      `intent: ${intentText}`,
      ...keyVariables,
    ];

    if (scene) promptParts.push(scene);
    if (typicalText) promptParts.push(typicalText);
    promptParts.push(style);
    promptParts.push(`purpose: ${mood}`);
    promptParts.push(tone);
    promptParts.push(aspectRatio);
    promptParts.push(fixed);
    promptParts.push(quality);

    return promptParts.join('，');
  }, [formValues.intent, formValues.stage, formValues.visualStyle, formValues.imageSize, formValues.productName, formValues.coreData, formValues.brandName]);

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
      <Navbar title="意图驱动配图生成器" showBack onBack={onBack} />
      
      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3">
          <WorkbenchForm onValuesChange={setFormValues} />
        </div>
        
        <div className="lg:w-2/3 space-y-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="mb-4">
              <label className="block text-sm text-white/60 mb-2">生成提示词预览</label>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm min-h-[60px]">
                {generatePrompt || '请先填写意图描述'}
              </div>
            </div>

            {/* 生成模式切换 */}
            <div className="flex gap-2 mb-4 bg-white/5 rounded-xl p-1 w-fit">
              <button
                onClick={() => setGenMode('single')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  genMode === 'single'
                    ? 'bg-purple-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                单张生成
              </button>
              <button
                onClick={() => setGenMode('batch')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  genMode === 'batch'
                    ? 'bg-purple-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                批量生成 4 种风格
              </button>
            </div>

            {genMode === 'single' && (
              <ImageGenerator
                prompt={generatePrompt}
                showInput={false}
                showCard={false}
                className="mt-0 max-w-none"
                disabled={!hasIntent}
                disabledHint="请先填写意图描述"
                size={formValues.imageSize === '1:1' ? '1024*1024' : formValues.imageSize === '9:16' ? '720*1280' : formValues.imageSize === '3:4' ? '768*1024' : '2K'}
              />
            )}

            {genMode === 'batch' && (
              <BatchImageGrid
                basePrompt={generatePrompt}
                size={formValues.imageSize === '1:1' ? '1024*1024' : formValues.imageSize === '9:16' ? '720*1280' : formValues.imageSize === '3:4' ? '768*1024' : '2K'}
                disabled={!hasIntent}
              />
            )}
          </div>

          <HistoryPanel />
        </div>
      </div>
    </div>
  );
}

function PromotionWorkbenchPage({ onBack }: { onBack: () => void }) {
  const [formValues, setFormValues] = useState<PromotionFormValues>({
    courseName: '',
    originalPrice: '',
    discountPrice: '',
    activityTime: '',
    activityLocation: '',
  });

  const hasCourseName = !!formValues.courseName.trim();

  const generatePrompt = () => {
    // [1] 用户填写的信息
    const userInfo: string[] = [];
    if (formValues.courseName) {
      userInfo.push(`${formValues.courseName}招生海报`);
    }
    if (formValues.originalPrice) {
      userInfo.push(`原价${formValues.originalPrice}`);
    }
    if (formValues.discountPrice) {
      userInfo.push(`限时优惠${formValues.discountPrice}`);
    }
    if (formValues.activityTime) {
      userInfo.push(formValues.activityTime);
    }
    if (formValues.activityLocation) {
      userInfo.push(formValues.activityLocation);
    }

    // [2] 固定视觉指令
    const visual = [
      'vibrant orange and red gradient, high contrast',
      'limited time offer badge, price tag, fireworks or stars',
      'bold headline at top, price prominently displayed, call-to-action button area',
      'promotional poster, energetic design, eye-catching',
      'vertical format 9:16, suitable for social media',
    ];

    // [3] 文字乱码优化
    const userText = userInfo.join('，');
    const hasPosterKeyword = /海报|配图/.test(userText);
    const textGuard = hasPosterKeyword
      ? 'use abstract decorative shapes instead of text rendering, avoid generating readable Chinese characters'
      : '';

    // [4] 质量指令
    const quality = 'high quality, detailed, professional';

    return [userText, ...visual, textGuard, quality].filter(Boolean).join('，');
  };

  const prompt = generatePrompt();

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
      <Navbar title="推广物料" showBack onBack={onBack} />
      
      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3">
          <PromotionForm onValuesChange={setFormValues} />
        </div>
        
        <div className="lg:w-2/3 space-y-8">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="mb-4">
              <label className="block text-sm text-white/60 mb-2">提示词预览</label>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm">
                {prompt}
              </div>
            </div>
            <ImageGenerator prompt={prompt} showInput={false} showCard={false} className="mt-0 max-w-none" disabled={!hasCourseName} disabledHint="请填写课程名称后再生成" />
          </div>
          
          <HistoryPanel />
        </div>
      </div>
    </div>
  );
}

function EnhancePage({ onBack }: { onBack: () => void }) {
  const [formValues, setFormValues] = useState<EnhanceFormValues>({
    imageBase64: null,
    imageName: '',
    intent: '',
    strength: 0.5,
  });

  const canGenerate = !!formValues.imageBase64 && formValues.intent.trim().length > 0;

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
      <Navbar title="智能美化" showBack onBack={onBack} />

      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3">
          <EnhanceForm onValuesChange={setFormValues} />
        </div>

        <div className="lg:w-2/3 space-y-8">
          {formValues.imageBase64 && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">原图</h3>
              <div className="rounded-xl overflow-hidden border border-white/10">
                <img src={formValues.imageBase64} alt="原图" className="w-full h-auto" />
              </div>
            </div>
          )}

          <ImageGenerator
            prompt={formValues.intent.trim()}
            showInput={false}
            showCard
            disabled={!canGenerate}
            disabledHint={!formValues.imageBase64 ? '请先上传图片' : '请填写美化意图'}
            imageUrl={formValues.imageBase64 || undefined}
            strength={formValues.strength}
          />

          <HistoryPanel />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleNavigateToWorkbench = useCallback(() => {
    setCurrentPage('workbench');
  }, []);

  const handleNavigateToPromotion = useCallback(() => {
    setCurrentPage('promotion');
  }, []);

  const handleNavigateToEnhance = useCallback(() => {
    setCurrentPage('enhance');
  }, []);

  const handleBack = useCallback(() => {
    setCurrentPage('home');
  }, []);

  useEffect(() => {
    window.addEventListener('navigateToWorkbench', handleNavigateToWorkbench);
    window.addEventListener('navigateToPromotion', handleNavigateToPromotion);
    window.addEventListener('navigateToEnhance', handleNavigateToEnhance);
    return () => {
      window.removeEventListener('navigateToWorkbench', handleNavigateToWorkbench);
      window.removeEventListener('navigateToPromotion', handleNavigateToPromotion);
      window.removeEventListener('navigateToEnhance', handleNavigateToEnhance);
    };
  }, [handleNavigateToWorkbench, handleNavigateToPromotion, handleNavigateToEnhance]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col px-6 py-12 relative overflow-hidden ${currentPage === 'home' ? 'items-center justify-center' : ''}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-purple-500/15 via-transparent to-transparent rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-purple-400/10 via-transparent to-transparent rounded-full animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-600/5 via-transparent to-transparent rounded-full animate-pulse" style={{ animationDuration: '8s', animationDelay: '4s' }} />
      </div>

      {currentPage === 'home' && <HomePage />}
      {currentPage === 'workbench' && <WorkbenchPage onBack={handleBack} />}
      {currentPage === 'promotion' && <PromotionWorkbenchPage onBack={handleBack} />}
      {currentPage === 'enhance' && <EnhancePage onBack={handleBack} />}
    </div>
  );
}
