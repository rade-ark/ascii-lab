import React from 'react';
import { Settings, Palette, Type, Image, Play, RotateCcw, Download, Lightbulb } from 'lucide-react';


import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { FileUpload } from './FileUpload';
import { ColorPalette } from './ColorPalette';
import { ColorInput } from './ColorInput';
import { ASCIIColorTrio } from './ASCIIColorTrio';
import { PresetSelect } from './PresetSelect';
import { EFFECT_PRESETS } from '../utils/presets';

interface MobileControlPanelProps {
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

export function MobileControlPanel({
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
}: MobileControlPanelProps) {
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
    <div className="h-80 bg-background minimal-card minimal-shadow-md flex flex-col">
      <Tabs defaultValue="canvas" className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <TabsContent value="canvas" className="mt-0 clean-stack">
              <div className="space-y-4">
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
                      className="flex-1 h-10 minimal-input"
                    />
                    <span className="mono-label">:</span>
                    <Input
                      type="number"
                      value={effectSettings.aspectRatio.height}
                      onChange={(e) => updateSetting('aspectRatio.height', parseFloat(e.target.value) || 1)}
                      className="flex-1 h-10 minimal-input"
                    />
                  </div>
                </div>



                <div className="space-y-2">
                  <div className="clean-cluster">
                    <Button onClick={onResetCamera} className="flex-1 h-10 minimal-button" variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Button onClick={onToggleRotation} className="flex-1 h-10 minimal-button-primary">
                      <Play className="w-4 h-4 mr-2" />
                      {autoRotate ? 'Stop' : 'Start'}
                    </Button>
                  </div>
                  <Button onClick={onExport} className="w-full h-10 minimal-button" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="mt-0 clean-stack">
              <div className="space-y-2">
                <Label htmlFor="preset-select" className="mono-label">Effect Presets</Label>
                <PresetSelect 
                  onPresetSelect={handlePresetSelect}
                  onPresetPreview={onPresetPreview}
                  onPresetPreviewEnd={onPresetPreviewEnd}
                  compact={true} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effect-type" className="mono-label">Effect Type</Label>
                <Select value={effectSettings.effectType} onValueChange={(value) => updateSetting('effectType', value)}>
                  <SelectTrigger className="h-10 minimal-input">
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

                  {(effectSettings.effectType === 'bayer' || effectSettings.effectType === 'noise') && (
                    <>
                      {effectSettings.effectType === 'bayer' && (
                        <div className="space-y-2">
                          <Label htmlFor="matrix-type" className="mono-label">Matrix Type</Label>
                          <Select 
                            value={effectSettings.dither.matrixType.toString()} 
                            onValueChange={(value) => updateSetting('dither.matrixType', parseInt(value))}
                          >
                            <SelectTrigger className="h-10 minimal-input">
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
                    </>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ascii" className="mt-0 clean-stack">
              {effectSettings.effectType === 'ascii' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="font-select" className="mono-label">Font</Label>
                    <Select value={effectSettings.ascii.font} onValueChange={(value) => updateSetting('ascii.font', value)}>
                      <SelectTrigger className="h-10 minimal-input">
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
                      className="h-10 minimal-input"
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
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground minimal-card p-4">
                  <Type className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="mono-label opacity-60">Select ASCII effect to customize text settings</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="lighting" className="mt-0 clean-stack">
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
            </TabsContent>

            <TabsContent value="colors" className="mt-0 clean-stack">
              {effectSettings.effectType !== 'none' ? (
                <>
                  <div className="flex items-center justify-between p-3 minimal-border bg-accent">
                    <Label htmlFor="use-palette" className="mono-label">Use Color Palette</Label>
                    <Checkbox
                      id="use-palette"
                      checked={effectSettings.colors.usePalette}
                      onCheckedChange={(checked) => updateSetting('colors.usePalette', checked)}
                    />
                  </div>

                  {!effectSettings.colors.usePalette && effectSettings.effectType === 'ascii' && (
                    <ColorInput
                      value={effectSettings.colors.background}
                      onChange={(value) => updateSetting('colors.background', value)}
                      label="Background Color"
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
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground minimal-card p-4">
                  <Palette className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="mono-label opacity-60">Select an effect to customize colors</p>
                </div>
              )}
            </TabsContent>
          </div>
        </div>

        <TabsList className="grid w-full grid-cols-5 bg-accent border-t border-border">
          <TabsTrigger value="canvas" className="clean-cluster gap-1 py-3 minimal-button data-[state=active]:minimal-button-primary">
            <Image className="w-4 h-4" />
            <span className="mono-label">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="lighting" className="clean-cluster gap-1 py-3 minimal-button data-[state=active]:minimal-button-primary">
            <Lightbulb className="w-4 h-4" />
            <span className="mono-label">Light</span>
          </TabsTrigger>
          <TabsTrigger value="effects" className="clean-cluster gap-1 py-3 minimal-button data-[state=active]:minimal-button-primary">
            <Settings className="w-4 h-4" />
            <span className="mono-label">Effects</span>
          </TabsTrigger>
          <TabsTrigger value="ascii" className="clean-cluster gap-1 py-3 minimal-button data-[state=active]:minimal-button-primary">
            <Type className="w-4 h-4" />
            <span className="mono-label">Text</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="clean-cluster gap-1 py-3 minimal-button data-[state=active]:minimal-button-primary">
            <Palette className="w-4 h-4" />
            <span className="mono-label">Color</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}