import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';

interface ColorPaletteProps {
  colors: string[];
  activeColors: boolean[];
  onColorChange: (index: number, color: string) => void;
  onActiveChange: (index: number, active: boolean) => void;
  onToggleReversePalette?: (checked: boolean) => void;
  reversePalette?: boolean;
}

export function ColorPalette({ 
  colors, 
  activeColors, 
  onColorChange, 
  onActiveChange, 
  onToggleReversePalette,
  reversePalette = false
}: ColorPaletteProps) {
  // Display colors in their current order (which may already be reversed in the parent)
  const displayColors = colors;
  const displayActiveColors = activeColors;

  return (
    <div className="space-y-3">
      {onToggleReversePalette && (
        <div className="flex items-center justify-between p-3 minimal-border bg-accent">
          <Label htmlFor="reverse-palette" className="mono-label">Reverse Palette</Label>
          <Checkbox
            id="reverse-palette"
            checked={reversePalette}
            onCheckedChange={onToggleReversePalette}
          />
        </div>
      )}
      
      <div className="space-y-2">
        {displayColors.map((color, index) => (
          <div key={index} className="minimal-card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="mono-label">Color {index + 1}</span>
              <Checkbox
                checked={displayActiveColors[index]}
                onCheckedChange={(checked) => onActiveChange(index, checked)}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 minimal-border bg-muted px-3 py-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onColorChange(index, e.target.value)}
                  className="w-6 h-6 border-none cursor-pointer"
                  style={{ appearance: 'none' }}
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                      onColorChange(index, e.target.value);
                    }
                  }}
                  className="bg-transparent flex-1 mono-label focus:outline-none text-foreground"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}