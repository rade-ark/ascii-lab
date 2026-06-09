import React from 'react';
import { ChevronDown, Settings, Palette, Lightbulb } from 'lucide-react';


import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { FileUpload } from './FileUpload';
import { ColorPalette } from './ColorPalette';
import { ColorInput } from './ColorInput';
import { ASCIIColorTrio } from './ASCIIColorTrio';
import { PresetSelect } from './PresetSelect';
import { EFFECT_PRESETS } from '../utils/presets';

interface ControlPanelProps {
  effectSettings: any;
  onEffectSettingsChange: (updates: any) => void;
  onFileSelect: (file: File) => void;
  onResetCamera: () => void;
  onToggleRotation: () => void;
  onExport: () => void;
  autoRotate: boolean;
  statusMessage: string;
  onPresetSelect: (presetId: string) => void;
  onPresetPreview?: (presetId: string) => void;
  onPresetPreviewEnd?: () => void;
  onToggleReversePalette?: (checked: boolean) => void;
}

const fontOptions = [
  { value: 'monospace', label: 'Default Monospace' },
  { value: 'Roboto Mono', label: 'Roboto Mono' },
  { value: 'Source Code Pro', label: 'Source Code Pro' },
  { value: 'Space Mono', label: 'Space Mono' },
  { value: 'Courier Prime', label: 'Courier Prime' },
  { value: 'VT323', label: 'VT323' },
  { value: 'Public Pixel', label: 'Public Pixel' },
  { value: 'Press Start 2P', label: 'Press Start 2P' },
  { value: 'Silkscreen', label: 'Silkscreen' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Lobster', label: 'Lobster' },
  { value: 'Pacifico', label: 'Pacifico' },
  { value: 'Uncial Antiqua', label: 'Uncial Antiqua' },
];

export function ControlPanel({
  effectSettings,
  onEffectSettingsChange,
  onFileSelect,
  onResetCamera,
  onToggleRotation,
  onExport,
  autoRotate,
  statusMessage,
  onPresetSelect,
  onPresetPreview,
  onPresetPreviewEnd,
  onToggleReversePalette
}: ControlPanelProps) {
  const updateSetting = (path: string, value: any) => {
    const keys = path.split('.');
    const updates: any = {};
    let current = updates;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    onEffectSettingsChange(updates);
  };

  const handlePresetSelect = (presetId: string) => {
    onPresetSelect(presetId);
  };

  return (
    <div className="w-full max-w-sm h-screen bg-background minimal-border flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 clean-stack">
          <Accordion type="multiple" defaultValue={["file-canvas", "effects"]} className="clean-stack">
            <AccordionItem value="file-canvas" className="minimal-card bg-card">
              <AccordionTrigger className="px-4 py-3 clean-interactive !items-center">
                <div className="clean-cluster">
                  <Settings className="w-4 h-4" />
                  <span className="mono-subtitle">File & Canvas</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="clean-stack">
                  <FileUpload 
                    onFileSelect={onFileSelect}
                    statusMessage={statusMessage}
                  />
                  
                  <div className="space-y-2">
                    <Label className="mono-label">Aspect Ratio</Label>
                    <div className="clean-cluster">
                      <Input
                        type="number"
                        value={effectSettings.aspectRatio.width}
                        onChange={(e) => updateSetting('aspectRatio.width', parseFloat(e.target.value) || 1)}
                        className="flex-1 minimal-input"
                      />
                      <span className="mono-label">:</span>
                      <Input
                        type="number"
                        value={effectSettings.aspectRatio.height}
                        onChange={(e) => updateSetting('aspectRatio.height', parseFloat(e.target.value) || 1)}
                        className="flex-1 minimal-input"
                      />
                    </div>
                  </div>


                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lighting" className="minimal-card bg-card">
              <AccordionTrigger className="px-4 py-3 clean-interactive !items-center">
                <div className="clean-cluster">
                  <Lightbulb className="w-4 h-4" />
                  <span className="mono-subtitle">Light</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="clean-stack">
                  <div className="space-y-3">

                    
                    <div className="space-y-2">
                      <Label className="mono-label">Angle: {effectSettings.lighting?.directionalAngle || -45}°</Label>
                      <Slider
                        value={[effectSettings.lighting?.directionalAngle || -45]}
                        onValueChange={([value]) => updateSetting('lighting.directionalAngle', value)}
                        min={-180}
                        max={180}
                        step={5}
                      />
                    </div>


                    
                    <div className="space-y-2">
                      <Label className="mono-label">Intensity: {effectSettings.lighting?.intensity || 80}%</Label>
                      <Slider
                        value={[effectSettings.lighting?.intensity || 80]}
                        onValueChange={([value]) => updateSetting('lighting.intensity', value)}
                        min={0}
                        max={200}
                        step={5}
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="effects" className="minimal-card bg-card">
              <AccordionTrigger className="px-4 py-3 clean-interactive !items-center">
                <div className="clean-cluster">
                  <Palette className="w-4 h-4" />
                  <span className="mono-subtitle">Effect Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="clean-stack">
                  <div className="space-y-2">
                    <Label htmlFor="preset-select" className="mono-label">Effect Presets</Label>
                    <PresetSelect 
                      onPresetSelect={handlePresetSelect}
                      onPresetPreview={onPresetPreview}
                      onPresetPreviewEnd={onPresetPreviewEnd}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="effect-type" className="mono-label">Effect Type</Label>
                    <Select value={effectSettings.effectType} onValueChange={(value) => updateSetting('effectType', value)}>
                      <SelectTrigger className="minimal-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="minimal-card">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="ascii">ASCII</SelectItem>
                        <SelectItem value="bayer">Bayer Dither</SelectItem>
                        <SelectItem value="noise">Noise Dither</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {effectSettings.effectType !== 'none' && (
                    <>
                      <div className="clean-stack pt-3 border-t border-border">
                        <div className="mono-subtitle">Levels</div>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label className="mono-label">Brightness: {effectSettings.brightness.toFixed(2)}</Label>
                            <Slider
                              value={[effectSettings.brightness]}
                              onValueChange={([value]) => updateSetting('brightness', value)}
                              min={-0.5}
                              max={0.5}
                              step={0.01}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="mono-label">Contrast: {effectSettings.contrast.toFixed(2)}</Label>
                            <Slider
                              value={[effectSettings.contrast]}
                              onValueChange={([value]) => updateSetting('contrast', value)}
                              min={0.5}
                              max={2.5}
                              step={0.01}
                            />
                          </div>
                        </div>
                      </div>

                      {effectSettings.effectType === 'ascii' && (
                        <div className="clean-stack pt-3 border-t border-border">
                          <div className="mono-subtitle">ASCII</div>
                          
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="font-select" className="mono-label">Font</Label>
                              <Select value={effectSettings.ascii.font} onValueChange={(value) => updateSetting('ascii.font', value)}>
                                <SelectTrigger className="minimal-input">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="minimal-card">
                                  {fontOptions.map((font) => (
                                    <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="characters" className="mono-label">Characters / Emojis</Label>
                              <Input
                                id="characters"
                                value={effectSettings.ascii.characters}
                                onChange={(e) => updateSetting('ascii.characters', e.target.value)}
                                className="minimal-input"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="mono-label">ASCII Resolution: {effectSettings.ascii.resolution}</Label>
                              <Slider
                                value={[effectSettings.ascii.resolution]}
                                onValueChange={([value]) => updateSetting('ascii.resolution', value)}
                                min={2}
                                max={14}
                                step={1}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="mono-label">Character Scale: {effectSettings.ascii.scale.toFixed(2)}</Label>
                              <Slider
                                value={[effectSettings.ascii.scale]}
                                onValueChange={([value]) => updateSetting('ascii.scale', value)}
                                min={0.1}
                                max={1.5}
                                step={0.05}
                              />
                            </div>

                            <ASCIIColorTrio
                              useColorTrio={effectSettings.ascii.useColorTrio}
                              singleColor={effectSettings.ascii.color}
                              colorTrio={effectSettings.ascii.colorTrio}
                              onToggleColorTrio={(enabled) => updateSetting('ascii.useColorTrio', enabled)}
                              onSingleColorChange={(color) => updateSetting('ascii.color', color)}
                              onColorTrioChange={(colors) => updateSetting('ascii.colorTrio', colors)}
                            />
                          </div>
                        </div>
                      )}

                      {(effectSettings.effectType === 'bayer' || effectSettings.effectType === 'noise') && (
                        <div className="clean-stack pt-3 border-t border-border">
                          <div className="mono-subtitle">Dither</div>
                          
                          {effectSettings.effectType === 'bayer' && (
                            <div className="space-y-2">
                              <Label htmlFor="matrix-type" className="mono-label">Matrix Type</Label>
                              <Select 
                                value={effectSettings.dither.matrixType.toString()} 
                                onValueChange={(value) => updateSetting('dither.matrixType', parseInt(value))}
                              >
                                <SelectTrigger className="minimal-input">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="minimal-card">
                                  <SelectItem value="0">2x2 Bayer</SelectItem>
                                  <SelectItem value="1">4x4 Bayer</SelectItem>
                                  <SelectItem value="2">8x8 Bayer</SelectItem>
                                  <SelectItem value="3">16x16 Bayer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label className="mono-label">Dither Scale: {effectSettings.dither.scale}</Label>
                            <Slider
                              value={[effectSettings.dither.scale]}
                              onValueChange={([value]) => updateSetting('dither.scale', value)}
                              min={1}
                              max={32}
                              step={1}
                            />
                          </div>
                        </div>
                      )}

                      <div className="clean-stack pt-3 border-t border-border">
                        <div className="flex items-center justify-between p-3 minimal-border bg-accent">
                          <Label htmlFor="color-palette" className="mono-label">Color Palette</Label>
                          <Switch
                            id="color-palette"
                            checked={effectSettings.colors.usePalette}
                            onCheckedChange={(checked) => updateSetting('colors.usePalette', checked)}
                          />
                        </div>

                        {!effectSettings.colors.usePalette && effectSettings.effectType === 'ascii' && (
                          <ColorInput
                            value={effectSettings.colors.background}
                            onChange={(value) => updateSetting('colors.background', value)}
                            label="Background"
                          />
                        )}

                        {effectSettings.colors.usePalette && (
                          <ColorPalette
                            colors={effectSettings.colors.palette}
                            activeColors={effectSettings.colors.active}
                            onColorChange={(index, color) => {
                              const newPalette = [...effectSettings.colors.palette];
                              newPalette[index] = color;
                              updateSetting('colors.palette', newPalette);
                            }}
                            onActiveChange={(index, active) => {
                              const newActive = [...effectSettings.colors.active];
                              newActive[index] = active;
                              updateSetting('colors.active', newActive);
                            }}
                            onToggleReversePalette={onToggleReversePalette}
                            reversePalette={effectSettings.colors.reversePalette}
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}