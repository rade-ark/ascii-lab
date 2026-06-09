import React from 'react';
import { ChevronDown, Type, Palette, Grid } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { EFFECT_PRESETS, EffectPreset } from '../utils/presets';

interface PresetSelectProps {
  onPresetSelect: (presetId: string) => void;
  onPresetPreview?: (presetId: string) => void;
  onPresetPreviewEnd?: () => void;
  placeholder?: string;
  compact?: boolean;
}

const categoryIcons = {
  ascii: Type,
  dither: Grid,
  mixed: Palette
};

const categoryColors = {
  ascii: 'text-blue-600',
  dither: 'text-purple-600',
  mixed: 'text-green-600'
};

export function PresetSelect({ 
  onPresetSelect, 
  onPresetPreview,
  onPresetPreviewEnd,
  placeholder = "Choose a preset...", 
  compact = false 
}: PresetSelectProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<string>('');
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    onPresetSelect(presetId);
    setIsOpen(false);
  };

  const handlePresetHover = (presetId: string) => {
    if (onPresetPreview && presetId !== 'none' && !presetId.includes('-header')) {
      onPresetPreview(presetId);
    }
  };

  const handlePresetLeave = () => {
    if (onPresetPreviewEnd) {
      onPresetPreviewEnd();
    }
  };

  return (
    <Select 
      value={selectedPreset}
      onValueChange={handleSelect}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger className="w-full minimal-input justify-start text-left">
        <SelectValue placeholder={placeholder} className="text-left" />
      </SelectTrigger>
      <SelectContent 
        onPointerLeave={handlePresetLeave}
        className="max-h-[400px] overflow-y-auto minimal-card"
      >
        <SelectItem value="none" className="cursor-pointer">
          <div className="flex items-center gap-2">
            <span>None (Custom)</span>
          </div>
        </SelectItem>
        
        {/* ASCII Effects */}
        <SelectItem disabled value="ascii-header" className="font-medium text-blue-600 text-xs">
          ASCII EFFECTS
        </SelectItem>
        {EFFECT_PRESETS.filter(p => p.category === 'ascii').map((preset) => {
          const Icon = categoryIcons[preset.category];
          return (
            <SelectItem 
              key={preset.id}
              value={preset.id} 
              className="pl-6 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors duration-150"
              onPointerEnter={() => handlePresetHover(preset.id)}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="font-medium">{preset.name}</span>
              </div>
            </SelectItem>
          );
        })}
        
        {/* Dither Effects */}
        <SelectItem disabled value="dither-header" className="font-medium text-purple-600 text-xs">
          DITHER EFFECTS
        </SelectItem>
        {EFFECT_PRESETS.filter(p => p.category === 'dither').map((preset) => {
          const Icon = categoryIcons[preset.category];
          return (
            <SelectItem 
              key={preset.id}
              value={preset.id} 
              className="pl-6 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors duration-150"
              onPointerEnter={() => handlePresetHover(preset.id)}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="font-medium">{preset.name}</span>
              </div>
            </SelectItem>
          );
        })}
        
        {/* Special Effects */}
        <SelectItem disabled value="mixed-header" className="font-medium text-green-600 text-xs">
          SPECIAL EFFECTS
        </SelectItem>
        {EFFECT_PRESETS.filter(p => p.category === 'mixed').map((preset) => {
          const Icon = categoryIcons[preset.category];
          return (
            <SelectItem 
              key={preset.id}
              value={preset.id} 
              className="pl-6 cursor-pointer hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors duration-150"
              onPointerEnter={() => handlePresetHover(preset.id)}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="font-medium">{preset.name}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}