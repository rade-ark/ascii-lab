import React from 'react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface ASCIIColorTrioProps {
  useColorTrio: boolean;
  singleColor: string;
  colorTrio: [string, string, string];
  onToggleColorTrio: (enabled: boolean) => void;
  onSingleColorChange: (color: string) => void;
  onColorTrioChange: (colors: [string, string, string]) => void;
}

export function ASCIIColorTrio({
  useColorTrio,
  singleColor,
  colorTrio,
  onToggleColorTrio,
  onSingleColorChange,
  onColorTrioChange
}: ASCIIColorTrioProps) {
  // Ensure colorTrio is always defined with fallback values
  const safeColorTrio = colorTrio || ['#000000', '#333333', '#666666'];
  const safeSingleColor = singleColor || '#000000';
  
  const handleColorChange = (index: number, color: string) => {
    const newColors = [...safeColorTrio] as [string, string, string];
    newColors[index] = color;
    onColorTrioChange(newColors);
  };

  const colorNames = ['Shadows', 'Midtones', 'Highlights'];

  return (
    <div className="space-y-3">
      {/* Toggle Switch */}
      <div className="flex items-center justify-between p-3 minimal-border bg-accent">
        <Label htmlFor="use-color-trio" className="mono-label">3-Color characters</Label>
        <Switch
          id="use-color-trio"
          checked={useColorTrio}
          onCheckedChange={onToggleColorTrio}
        />
      </div>

      {useColorTrio ? (
        <div className="space-y-2">
          {safeColorTrio.map((color, index) => (
            <div key={index} className="minimal-card p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="mono-label">{colorNames[index]}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1 minimal-border bg-muted px-3 py-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="w-6 h-6 border-none cursor-pointer"
                    style={{ appearance: 'none' }}
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => {
                      if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                        handleColorChange(index, e.target.value);
                      }
                    }}
                    className="bg-transparent flex-1 mono-label focus:outline-none text-foreground"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="minimal-card p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="mono-label">Character Color</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 minimal-border bg-muted px-3 py-2">
              <input
                type="color"
                value={safeSingleColor}
                onChange={(e) => onSingleColorChange(e.target.value)}
                className="w-6 h-6 border-none cursor-pointer"
                style={{ appearance: 'none' }}
              />
              <input
                type="text"
                value={safeSingleColor}
                onChange={(e) => {
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                    onSingleColorChange(e.target.value);
                  }
                }}
                className="bg-transparent flex-1 mono-label focus:outline-none text-foreground"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}