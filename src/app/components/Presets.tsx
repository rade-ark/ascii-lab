import React from 'react';
import { Palette, Type, Grid, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { EFFECT_PRESETS, EffectPreset, getPresetsByCategory } from '../utils/presets';

interface PresetsProps {
  onPresetSelect: (preset: EffectPreset) => void;
  selectedCategory?: 'ascii' | 'dither' | 'mixed' | 'all';
  compact?: boolean;
}

const categoryIcons = {
  ascii: Type,
  dither: Grid,
  mixed: Sparkles
};

const categoryColors = {
  ascii: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  dither: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  mixed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
};

export function Presets({ onPresetSelect, selectedCategory = 'all', compact = false }: PresetsProps) {
  const presets = selectedCategory === 'all' ? EFFECT_PRESETS : getPresetsByCategory(selectedCategory);
  
  const groupedPresets = presets.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, EffectPreset[]>);

  const PresetCard = ({ preset }: { preset: EffectPreset }) => {
    const Icon = categoryIcons[preset.category];
    
    return (
      <Button
        variant="outline"
        className={`h-auto p-3 flex flex-col items-start gap-2 hover:bg-accent/50 transition-colors ${
          compact ? 'min-h-[80px]' : 'min-h-[100px]'
        }`}
        onClick={() => onPresetSelect(preset)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium`}>
              {preset.name}
            </span>
          </div>
          <Badge variant="secondary" className={`${categoryColors[preset.category]} text-xs px-2 py-0.5`}>
            {preset.category}
          </Badge>
        </div>
        
        <p className={`${compact ? 'text-xs' : 'text-xs'} text-muted-foreground text-left leading-relaxed`}>
          {preset.description}
        </p>
        
        {preset.settings.ascii && !compact && (
          <div className="w-full mt-1">
            <div className="text-xs text-muted-foreground bg-muted rounded px-2 py-1 font-mono truncate">
              "{preset.settings.ascii.characters.slice(0, 15)}..."
            </div>
          </div>
        )}
      </Button>
    );
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          {presets.slice(0, 6).map((preset) => (
            <PresetCard key={preset.id} preset={preset} />
          ))}
        </div>
        {presets.length > 6 && (
          <p className="text-xs text-muted-foreground text-center">
            {presets.length - 6} more presets available
          </p>
        )}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] w-full">
      <div className="space-y-4 pr-4">
        {Object.entries(groupedPresets).map(([category, categoryPresets]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {React.createElement(categoryIcons[category as keyof typeof categoryIcons], { 
                  className: "w-4 h-4" 
                })}
                <h4 className="text-sm font-medium capitalize">{category} Effects</h4>
              </div>
              <Badge variant="outline" className="text-xs">
                {categoryPresets.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {categoryPresets.map((preset) => (
                <PresetCard key={preset.id} preset={preset} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}