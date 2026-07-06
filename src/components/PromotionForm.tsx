import { useState, useEffect } from 'react';

export interface PromotionFormValues {
  courseName: string;
  originalPrice: string;
  discountPrice: string;
  activityTime: string;
  activityLocation: string;
}

interface PromotionFormProps {
  onValuesChange: (values: PromotionFormValues) => void;
}

const fields: { key: keyof PromotionFormValues; label: string; placeholder: string }[] = [
  { key: 'courseName', label: '课程名称', placeholder: '例如：少儿英语启蒙班' },
  { key: 'originalPrice', label: '原价', placeholder: '例如：2999元' },
  { key: 'discountPrice', label: '优惠价', placeholder: '例如：1999元' },
  { key: 'activityTime', label: '活动时间', placeholder: '例如：7月15日-7月30日' },
  { key: 'activityLocation', label: '活动地点', placeholder: '例如：XX教育培训中心' },
];

export default function PromotionForm({ onValuesChange }: PromotionFormProps) {
  const [values, setValues] = useState<PromotionFormValues>({
    courseName: '',
    originalPrice: '',
    discountPrice: '',
    activityTime: '',
    activityLocation: '',
  });

  useEffect(() => {
    onValuesChange(values);
  }, [values, onValuesChange]);

  const handleChange = (key: keyof PromotionFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">推广物料信息</h3>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm text-white/60 mb-2">{field.label}</label>
            <input
              type="text"
              value={values[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
