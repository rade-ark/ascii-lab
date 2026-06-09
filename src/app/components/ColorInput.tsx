import React from 'react';
import { Label } from './ui/label';

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const ColorInput = React.memo(({ value, onChange, label }: ColorInputProps) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 cursor-pointer rounded"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300 select-none font-mono">
          {value}
        </span>
      </div>
    </div>
  );
});

ColorInput.displayName = 'ColorInput';

export { ColorInput };