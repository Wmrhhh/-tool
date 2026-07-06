import { useState, useRef } from 'react';

export interface EnhanceFormValues {
  imageBase64: string | null;
  imageName: string;
  intent: string;
  strength: number;
}

interface EnhanceFormProps {
  onValuesChange: (values: EnhanceFormValues) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function EnhanceForm({ onValuesChange }: EnhanceFormProps) {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState('');
  const [intent, setIntent] = useState('');
  const [strength, setStrength] = useState(0.5);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isReading, setIsReading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setUploadError('');

    if (!file.type.startsWith('image/')) {
      setUploadError('请上传图片文件（JPG/PNG/WEBP）');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('图片过大，建议压缩后上传');
      return;
    }

    setIsReading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageBase64(result);
      setImageName(file.name);
      setIsReading(false);
      onValuesChange({ imageBase64: result, imageName: file.name, intent, strength });
    };
    reader.onerror = () => {
      setIsReading(false);
      setUploadError('图片读取失败，请重试');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    setImageName('');
    setUploadError('');
    setIsReading(false);
    onValuesChange({ imageBase64: null, imageName: '', intent, strength });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleIntentChange = (value: string) => {
    setIntent(value);
    onValuesChange({ imageBase64, imageName, intent: value, strength });
  };

  const handleStrengthChange = (value: number) => {
    setStrength(value);
    onValuesChange({ imageBase64, imageName, intent, strength: value });
  };

  const strengthLabel = strength <= 0.35 ? '轻微调整' : strength <= 0.65 ? '适度美化' : '大幅重构';

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-6">
      {/* 图片上传区域 */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">上传图片</h3>
        {imageBase64 ? (
          <div className="relative">
            <img
              src={imageBase64}
              alt="已上传的图片"
              className="w-full rounded-xl border border-white/10 max-h-48 object-contain bg-black/20"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-white/60 truncate">{imageName}</span>
              <button
                onClick={handleRemoveImage}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                重新上传
              </button>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
              dragOver
                ? 'border-purple-400 bg-purple-500/10'
                : 'border-white/20 hover:border-purple-400/50 hover:bg-white/5'
            }`}
          >
            {isReading ? (
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-8 w-8 text-purple-400 mb-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-white/60 text-sm">正在读取...</p>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-2">📁</div>
                <p className="text-white/60 text-sm">点击或拖拽上传图片</p>
                <p className="text-white/40 text-xs mt-1">支持 JPG/PNG/WEBP，不超过 10MB</p>
              </>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/bmp"
          onChange={handleInputChange}
          className="hidden"
        />
        {uploadError && (
          <p className="text-red-400 text-sm mt-2">{uploadError}</p>
        )}
      </div>

      {/* 美化意图描述 */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">美化意图</h3>
        <textarea
          value={intent}
          onChange={(e) => handleIntentChange(e.target.value)}
          placeholder="例如：让这张图更专业，适合教育行业&#10;例如：换成温暖色调，加一些学习元素&#10;例如：去掉杂乱背景，突出主体"
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 resize-none"
        />
      </div>

      {/* 参考强度 */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">变化强度</h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.1}
            value={strength}
            onChange={(e) => handleStrengthChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
          />
          <span className="text-sm text-white/80 min-w-[5em] text-right">{strength.toFixed(1)} · {strengthLabel}</span>
        </div>
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>轻微调整</span>
          <span>大幅重构</span>
        </div>
      </div>
    </div>
  );
}
