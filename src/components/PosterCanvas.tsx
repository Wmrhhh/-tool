import { useRef, useEffect } from 'react';
import type { MarketingStage, VisualStyle } from '@/components/WorkbenchForm';

export interface PosterTextConfig {
  mainTitle: string;
  subtitle: string;
  brandName: string;
  callToAction: string;
  visualStyle: VisualStyle;
  stage: MarketingStage;
}

interface PosterCanvasProps {
  backgroundUrl: string | null;
  textConfig: PosterTextConfig;
  sceneName: string;
}

const stageColorMap: Record<MarketingStage, { accent: string; accentDark: string }> = {
  acquisition: { accent: '#f97316', accentDark: '#c2410c' },
  retention: { accent: '#16a34a', accentDark: '#15803d' },
  inquiry: { accent: '#6366f1', accentDark: '#4f46e5' },
  shaping: { accent: '#ec4899', accentDark: '#be185d' },
  spread: { accent: '#ef4444', accentDark: '#b91c1c' },
  decision: { accent: '#dc2626', accentDark: '#991b1b' },
};

export default function PosterCanvas({ backgroundUrl, textConfig, sceneName }: PosterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    const draw = () => {
      if (backgroundUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          drawText(ctx, width, height);
        };
        img.onerror = () => {
          drawFallbackBg(ctx, width, height);
          drawText(ctx, width, height);
        };
        img.src = backgroundUrl;
      } else {
        drawFallbackBg(ctx, width, height);
        drawText(ctx, width, height);
      }
    };

    const drawFallbackBg = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, '#1e1b4b');
      gradient.addColorStop(1, '#312e81');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    };

    const roundRect = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    const drawTextBg = (
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      fontSize: number,
      align: CanvasTextAlign,
      paddingX: number,
      paddingY: number,
      radius: number,
      bgColor: string
    ) => {
      ctx.font = `bold ${fontSize}px "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif`;
      ctx.textAlign = align;
      ctx.textBaseline = 'middle';
      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const bgWidth = textWidth + paddingX * 2;
      const bgHeight = fontSize + paddingY * 2;

      let bgX = x;
      if (align === 'center') bgX = x - bgWidth / 2;
      else if (align === 'right') bgX = x - bgWidth;

      ctx.fillStyle = bgColor;
      roundRect(ctx, bgX, y - bgHeight / 2, bgWidth, bgHeight, radius);
      ctx.fill();
    };

    const colors = stageColorMap[textConfig.stage];

    const drawText = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      if (textConfig.visualStyle === 'design') {
        drawDesignStyle(ctx, w, h);
      } else if (textConfig.visualStyle === 'infographic') {
        drawInfographicStyle(ctx, w, h);
      } else if (textConfig.visualStyle === 'knowledge') {
        drawKnowledgeStyle(ctx, w, h);
      } else {
        drawMetaphorStyle(ctx, w, h);
      }
    };

    const drawDesignStyle = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const topArea = h / 3;
      const centerY = topArea / 2 + 20;

      // 主标题：大字号居中
      if (textConfig.mainTitle) {
        const fontSize = 72;
        drawTextBg(ctx, textConfig.mainTitle, w / 2, centerY, fontSize, 'center', 40, 20, 16, 'rgba(0, 0, 0, 0.55)');
        ctx.font = `bold ${fontSize}px "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(textConfig.mainTitle, w / 2, centerY);
      }

      // 副标题：主标题下方
      if (textConfig.subtitle) {
        const fontSize = 30;
        const subY = centerY + 70;
        drawTextBg(ctx, textConfig.subtitle, w / 2, subY, fontSize, 'center', 24, 10, 8, 'rgba(0, 0, 0, 0.4)');
        ctx.font = `${fontSize}px "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(textConfig.subtitle, w / 2, subY);
      }

      // 品牌名：左下角
      if (textConfig.brandName) {
        const fontSize = 22;
        const x = 40;
        const y = h - 35;
        ctx.font = `500 ${fontSize}px "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        const metrics = ctx.measureText(textConfig.brandName);
        const bgW = metrics.width + 32;
        const bgH = fontSize + 16;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        roundRect(ctx, x - 16, y - bgH + 8, bgW, bgH, 6);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillText(textConfig.brandName, x, y);
      }

      // 行动号召按钮：底部居中
      if (textConfig.callToAction) {
        const fontSize = 32;
        const btnY = h - 80;
        ctx.font = `bold ${fontSize}px "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const metrics = ctx.measureText(textConfig.callToAction);
        const btnW = metrics.width + 80;
        const btnH = fontSize + 36;
        const btnX = (w - btnW) / 2;

        ctx.fillStyle = colors.accent;
        roundRect(ctx, btnX, btnY - btnH / 2, btnW, btnH, btnH / 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(textConfig.callToAction, w / 2, btnY);
      }
    };

    const drawInfographicStyle = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const topArea = h / 3;
      const centerY = topArea / 2;

      // 主标题作为大号数据数字显示
      if (textConfig.mainTitle) {
        const fontSize = 96;
        ctx.font = `bold ${fontSize}px "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = colors.accent;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 6;
        ctx.strokeText(textConfig.mainTitle, w / 2, centerY);
        ctx.fillText(textConfig.mainTitle, w / 2, centerY);
      }

      // 副标题在数据下方
      if (textConfig.subtitle) {
        const fontSize = 28;
        const subY = centerY + 80;
        drawTextBg(ctx, textConfig.subtitle, w / 2, subY, fontSize, 'center', 28, 12, 10, 'rgba(0, 0, 0, 0.5)');
        ctx.font = `500 ${fontSize}px "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(textConfig.subtitle, w / 2, subY);
      }

      // 左右两个装饰数据块
      const blockY = h * 0.55;
      const blockW = 220;
      const blockH = 100;
      const leftX = w * 0.2 - blockW / 2;
      const rightX = w * 0.8 - blockW / 2;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      roundRect(ctx, leftX, blockY, blockW, blockH, 16);
      ctx.fill();
      roundRect(ctx, rightX, blockY, blockW, blockH, 16);
      ctx.fill();

      ctx.font = 'bold 36px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('数据A', leftX + blockW / 2, blockY + blockH / 2 - 10);
      ctx.fillText('数据B', rightX + blockW / 2, blockY + blockH / 2 - 10);

      ctx.font = '18px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('指标说明', leftX + blockW / 2, blockY + blockH / 2 + 28);
      ctx.fillText('指标说明', rightX + blockW / 2, blockY + blockH / 2 + 28);

      // 品牌名：左下角
      if (textConfig.brandName) {
        const fontSize = 22;
        const x = 40;
        const y = h - 35;
        ctx.font = `500 ${fontSize}px "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillText(textConfig.brandName, x, y);
      }

      // 行动号召：右下角
      if (textConfig.callToAction) {
        const fontSize = 26;
        const x = w - 40;
        const y = h - 35;
        ctx.font = `bold ${fontSize}px "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        const metrics = ctx.measureText(textConfig.callToAction);
        const bgW = metrics.width + 40;
        const bgH = fontSize + 20;
        ctx.fillStyle = colors.accent;
        roundRect(ctx, x - bgW + 20, y - bgH + 10, bgW, bgH, bgH / 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText(textConfig.callToAction, x, y);
      }
    };

    const drawKnowledgeStyle = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      // 顶部卡片区域：标题
      const cardX = 60;
      const cardY = 40;
      const cardW = w - 120;
      const cardH = 160;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      roundRect(ctx, cardX, cardY, cardW, cardH, 20);
      ctx.fill();

      if (textConfig.mainTitle) {
        ctx.font = 'bold 48px "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1f2937';
        ctx.fillText(textConfig.mainTitle, w / 2, cardY + cardH / 2 - 15);
      }

      if (textConfig.subtitle) {
        ctx.font = '24px "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(textConfig.subtitle, w / 2, cardY + cardH / 2 + 35);
      }

      // 下方3个要点卡片
      const points = ['要点一', '要点二', '要点三'];
      const pointCardW = (cardW - 60) / 3;
      const pointCardH = 140;
      const pointY = cardY + cardH + 40;

      for (let i = 0; i < 3; i++) {
        const px = cardX + i * (pointCardW + 30);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        roundRect(ctx, px, pointY, pointCardW, pointCardH, 16);
        ctx.fill();

        // 序号圆
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(px + 40, pointY + 40, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 28px "PingFang SC", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), px + 40, pointY + 40);

        ctx.font = 'bold 26px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#1f2937';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(points[i], px + 80, pointY + 40);

        ctx.font = '20px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('详细说明内容', px + 40, pointY + 90);
      }

      // 品牌名 + CTA：底部
      const bottomY = h - 50;
      if (textConfig.brandName) {
        ctx.font = '22px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(textConfig.brandName, 60, bottomY);
      }

      if (textConfig.callToAction) {
        const fontSize = 26;
        ctx.font = `bold ${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
        ctx.textAlign = 'right';
        const metrics = ctx.measureText(textConfig.callToAction);
        const btnW = metrics.width + 56;
        const btnH = fontSize + 24;
        const btnX = w - 60 - btnW;
        ctx.fillStyle = colors.accent;
        roundRect(ctx, btnX, bottomY - btnH / 2, btnW, btnH, btnH / 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';
        ctx.fillText(textConfig.callToAction, w - 60 - 28, bottomY);
      }
    };

    const drawMetaphorStyle = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      // 中间垂直分割线
      const midX = w / 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(midX, 60);
      ctx.lineTo(midX, h - 120);
      ctx.stroke();
      ctx.setLineDash([]);

      // 中间冲击性主标题
      if (textConfig.mainTitle) {
        const fontSize = 56;
        ctx.font = `bold ${fontSize}px "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const bgW = 480;
        const bgH = fontSize + 40;
        const bgX = midX - bgW / 2;
        const bgY = h / 2 - bgH / 2;

        ctx.fillStyle = colors.accent;
        roundRect(ctx, bgX, bgY, bgW, bgH, 16);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(textConfig.mainTitle, midX, h / 2);
      }

      // 左侧：痛点/问题
      ctx.font = 'bold 36px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

      const leftCenterX = w / 4;
      const rightCenterX = (w * 3) / 4;
      const sideY = h / 2 - 120;

      // 左侧标签
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      roundRect(ctx, leftCenterX - 100, sideY - 30, 200, 60, 30);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText('现状 · 问题', leftCenterX, sideY);

      // 右侧标签
      ctx.fillStyle = colors.accent;
      roundRect(ctx, rightCenterX - 100, sideY - 30, 200, 60, 30);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText('我们 · 方案', rightCenterX, sideY);

      // 副标题
      if (textConfig.subtitle) {
        const fontSize = 24;
        const subY = h / 2 + 100;
        ctx.font = `${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        drawTextBg(ctx, textConfig.subtitle, midX, subY, fontSize, 'center', 24, 10, 8, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = '#ffffff';
        ctx.fillText(textConfig.subtitle, midX, subY);
      }

      // 品牌名：左下角
      if (textConfig.brandName) {
        const fontSize = 22;
        ctx.font = `500 ${fontSize}px "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillText(textConfig.brandName, 40, h - 35);
      }

      // 行动号召：底部居中
      if (textConfig.callToAction) {
        const fontSize = 30;
        const btnY = h - 70;
        ctx.font = `bold ${fontSize}px "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const metrics = ctx.measureText(textConfig.callToAction);
        const btnW = metrics.width + 72;
        const btnH = fontSize + 32;
        const btnX = (w - btnW) / 2;
        ctx.fillStyle = colors.accent;
        roundRect(ctx, btnX, btnY - btnH / 2, btnW, btnH, btnH / 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText(textConfig.callToAction, w / 2, btnY);
      }
    };

    draw();
  }, [backgroundUrl, textConfig, sceneName]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const now = new Date();
      const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      a.download = `海报-${sceneName}-${ts}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full rounded-xl overflow-hidden border border-white/10 shadow-lg">
        <canvas
          ref={canvasRef}
          className="w-full h-auto block"
          style={{ aspectRatio: '16 / 9' }}
        />
      </div>
      <button
        onClick={handleDownload}
        disabled={!backgroundUrl}
        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        下载海报
      </button>
    </div>
  );
}
