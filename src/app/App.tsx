import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, Download, RotateCcw, Pause, Play } from 'lucide-react';
import { Button } from './components/ui/button';
import { ControlPanel } from './components/ControlPanel';
import { ExportModal } from './components/ExportModal';
import ThreeJSRenderer from './components/ThreeJSRenderer';
import { CustomCursor, useCursor } from './components/CustomCursor';

// Font loading utility
const loadedFonts = new Set(['monospace']);

function loadFont(fontName: string) {
  if (loadedFonts.has(fontName)) return Promise.resolve();
  
  const fontUrlName = fontName.replace(/ /g, '+');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontUrlName}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
  document.head.appendChild(link);
  
  return document.fonts.load(`1em "${fontName}"`).then(() => {
    loadedFonts.add(fontName);
  }).catch(err => console.error(`Font failed to load: ${fontName}`, err));
}

export default function App() {
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const rendererRef = useRef<any>(null);
  
  // Custom cursor state
  const { cursorState, isVisible: isCursorVisible, showCursor, hideCursor, changeCursorState } = useCursor();
  const [customCursorEnabled, setCustomCursorEnabled] = useState(true);

  const [effectSettings, setEffectSettings] = useState({
    effectType: 'ascii',
    brightness: 0.0,
    contrast: 1.0,
    target: {
      mode: 'fullScene', // 'fullScene', 'contentOnly', 'backgroundOnly'
      background: {
        type: 'solid', // 'solid', 'gradient', 'transparent', 'originalScene'
        solidColor: '#eeeeee',
        gradientStart: '#eeeeee',
        gradientEnd: '#ffffff',
        gradientDirection: 'vertical' // 'vertical', 'horizontal', 'diagonal'
      }
    },
    ascii: {
      font: 'monospace',
      characters: ' .:-=+*#%@',
      resolution: 6,
      scale: 0.9,
      color: '#000000',
      colorTrio: ['#000000', '#333333', '#666666'],
      useColorTrio: false
    },
    dither: {
      matrixType: 2,
      scale: 3
    },
    colors: {
      usePalette: true,
      reversePalette: false,
      background: '#eeeeee',
      palette: ['#1b1c19', '#5f2398', '#025ffb', '#f0e800', '#f1cccc'],
      active: [true, true, true, true, true]
    },
    aspectRatio: {
      width: 1,
      height: 1
    },
    lighting: {
      directionalAngle: -45,
      intensity: 80
    },
    isDark: false
  });

  // Preview state for hover effects
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [originalSettings, setOriginalSettings] = useState(null);

  // Set default aspect ratio to 1:1
  useEffect(() => {
    const defaultAspectRatio = { width: 1, height: 1 };

    setEffectSettings(prev => ({
      ...prev,
      aspectRatio: defaultAspectRatio
    }));
  }, []);

  // Calculate canvas dimensions
  const calculateCanvasDimensions = useCallback(() => {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const targetRatio = effectSettings.aspectRatio.width / effectSettings.aspectRatio.height;

    let width = containerWidth;
    let height = containerHeight;

    // Account for top bar height (approximately 56px with padding)
    const topBarHeight = 56;

    // Always use desktop layout with left sidebar
    width = containerWidth - 400; // sidebar width
    height = containerHeight - 32 - topBarHeight; // padding + top bar

    if (width / height > targetRatio) {
      width = height * targetRatio;
    } else {
      height = width / targetRatio;
    }

    return { width: Math.max(300, width), height: Math.max(200, height), aspectRatio: targetRatio };
  }, [effectSettings.aspectRatio.width, effectSettings.aspectRatio.height]);

  const [canvasDimensions, setCanvasDimensions] = useState(() => calculateCanvasDimensions());

  // Update canvas dimensions when aspect ratio or window size changes
  useEffect(() => {
    const updateDimensions = () => {
      setCanvasDimensions(calculateCanvasDimensions());
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [calculateCanvasDimensions]);

  // Handle dark mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      setEffectSettings(prev => ({ ...prev, isDark: e.matches }));
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load Newsreader font for watermark
  useEffect(() => {
    loadFont('Newsreader');
  }, []);

  // Load fonts when ASCII font changes
  useEffect(() => {
    if (effectSettings.effectType === 'ascii') {
      loadFont(effectSettings.ascii.font);
    }
  }, [effectSettings.ascii.font, effectSettings.effectType]);

  const handleEffectSettingsChange = useCallback((updates: any) => {
    setEffectSettings(prev => {
      const newSettings = { ...prev };
      
      // Deep merge updates
      function deepMerge(target: any, source: any) {
        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
      
      deepMerge(newSettings, updates);
      return newSettings;
    });
  }, []);

  // Handle palette reverse toggle
  const handleToggleReversePalette = useCallback((checked: boolean) => {
    setEffectSettings(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        reversePalette: checked
      }
    }));
  }, []);

  // Calculate effective palette (reversed if needed)
  const getEffectivePalette = useCallback(() => {
    const { palette, active, reversePalette } = effectSettings.colors;
    if (reversePalette) {
      return {
        palette: [...palette].reverse(),
        active: [...active].reverse()
      };
    }
    return { palette, active };
  }, [effectSettings.colors.palette, effectSettings.colors.active, effectSettings.colors.reversePalette]);

  // Handle preset preview start (hover)
  const handlePresetPreview = useCallback((presetId: string) => {
    if (!isPreviewActive) {
      // Store original settings
      setOriginalSettings({ ...effectSettings });
      setIsPreviewActive(true);
    }
    
    if (presetId === 'none') {
      // Preview default settings
      setEffectSettings(prev => ({
        ...prev,
        effectType: 'ascii',
        brightness: 0.0,
        contrast: 1.0,
        target: {
          mode: 'fullScene',
          background: {
            type: 'solid',
            solidColor: '#eeeeee',
            gradientStart: '#eeeeee',
            gradientEnd: '#ffffff',
            gradientDirection: 'vertical'
          }
        },
        ascii: {
          font: 'monospace',
          characters: ' .:-=+*#%@',
          resolution: 6,
          scale: 0.9,
          color: '#000000',
          colorTrio: ['#000000', '#333333', '#666666'],
          useColorTrio: false
        },
        dither: {
          matrixType: 2,
          scale: 3
        },
        colors: {
          usePalette: true,
          reversePalette: false,
          background: '#eeeeee',
          palette: ['#1b1c19', '#5f2398', '#025ffb', '#f0e800', '#f1cccc'],
          active: [true, true, true, true, true]
        },
        aspectRatio: {
          width: 1,
          height: 1
        }
      }));
    } else {
      // Apply preset settings temporarily
      import('./utils/presets').then(({ getPresetById }) => {
        const preset = getPresetById(presetId);
        if (preset) {
          // Load font if it's an ASCII preset
          if (preset.settings.effectType === 'ascii' && preset.settings.ascii?.font) {
            loadFont(preset.settings.ascii.font);
          }
          
          setEffectSettings(prev => ({
            ...prev,
            ...preset.settings
          }));
        }
      });
    }
  }, [effectSettings, isPreviewActive]);

  // Handle preset preview end (mouse leave)
  const handlePresetPreviewEnd = useCallback(() => {
    if (isPreviewActive && originalSettings) {
      // Restore original settings
      setEffectSettings(originalSettings);
      setOriginalSettings(null);
      setIsPreviewActive(false);
    }
  }, [isPreviewActive, originalSettings]);

  // Handle preset selection (click/final selection)
  const handlePresetSelect = useCallback((presetId: string) => {
    if (presetId === 'none') {
      // Reset to default settings
      setEffectSettings(prev => ({
        ...prev,
        effectType: 'ascii',
        brightness: 0.0,
        contrast: 1.0,
        target: {
          mode: 'fullScene',
          background: {
            type: 'solid',
            solidColor: '#eeeeee',
            gradientStart: '#eeeeee',
            gradientEnd: '#ffffff',
            gradientDirection: 'vertical'
          }
        },
        ascii: {
          font: 'monospace',
          characters: ' .:-=+*#%@',
          resolution: 6,
          scale: 0.9,
          color: '#000000',
          colorTrio: ['#000000', '#333333', '#666666'],
          useColorTrio: false
        },
        dither: {
          matrixType: 2,
          scale: 3
        },
        colors: {
          usePalette: true,
          reversePalette: false,
          background: '#eeeeee',
          palette: ['#1b1c19', '#5f2398', '#025ffb', '#f0e800', '#f1cccc'],
          active: [true, true, true, true, true]
        },
        aspectRatio: {
          width: 1,
          height: 1
        },
        lighting: {
          directionalAngle: -45,
          intensity: 80
        }
      }));
    } else {
      import('./utils/presets').then(({ getPresetById }) => {
        const preset = getPresetById(presetId);
        if (preset) {
          // Load font if it's an ASCII preset
          if (preset.settings.effectType === 'ascii' && preset.settings.ascii?.font) {
            loadFont(preset.settings.ascii.font);
          }
          
          setEffectSettings(prev => ({
            ...prev,
            ...preset.settings
          }));
        }
      });
    }
    
    // Clear preview state
    if (isPreviewActive) {
      setOriginalSettings(null);
      setIsPreviewActive(false);
    }
  }, [isPreviewActive]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!rendererRef.current) return;
    
    setStatusMessage('Loading...');
    try {
      await rendererRef.current.loadFile(file);
      setStatusMessage('Load complete.');
    } catch (error) {
      console.error('Error loading file:', error);
      setStatusMessage('Error loading file.');
    }
  }, []);

  const handleVideoLoad = useCallback((videoAspectRatio: { width: number; height: number }) => {
    // Turn off rotation for videos
    setAutoRotate(false);
    
    // Set aspect ratio to match video
    setEffectSettings(prev => ({
      ...prev,
      aspectRatio: {
        width: videoAspectRatio.width,
        height: videoAspectRatio.height
      }
    }));
  }, []);

  const handleImageLoad = useCallback((imageAspectRatio: { width: number; height: number }) => {
    // Turn off rotation for images
    setAutoRotate(false);
    
    // Set aspect ratio to match image
    setEffectSettings(prev => ({
      ...prev,
      aspectRatio: {
        width: imageAspectRatio.width,
        height: imageAspectRatio.height
      }
    }));
  }, []);

  const handleResetCamera = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.resetCamera();
    }
  }, []);

  const handleToggleRotation = useCallback(() => {
    setAutoRotate(prev => !prev);
  }, []);

  const handleExport = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  const handleExportModalClose = useCallback(() => {
    setIsExportModalOpen(false);
    setIsExporting(false);
    setExportProgress(0);
  }, []);

  const handleExportStart = useCallback(async (format: 'png' | 'mp4', scale: number) => {
    if (!rendererRef.current) return;
    
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      let dataUrl: string;
      
      if (format === 'png') {
        dataUrl = await rendererRef.current.exportImage(scale);
        setExportProgress(100);
      } else if (format === 'mp4') {
        dataUrl = await rendererRef.current.exportVideo(scale, (progress) => {
          setExportProgress(progress);
        });
      } else {
        throw new Error('Unsupported format');
      }
      
      // Create download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `canvas-export-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL for videos
      if (format === 'mp4') {
        URL.revokeObjectURL(dataUrl);
      }
      
      // Close modal after a short delay
      setTimeout(() => {
        handleExportModalClose();
      }, 1000);
      
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [handleExportModalClose]);

  // Cursor event handlers
  const handleCanvasMouseEnter = useCallback(() => {
    if (customCursorEnabled) {
      showCursor('default');
    }
  }, [showCursor, customCursorEnabled]);

  const handleCanvasMouseLeave = useCallback(() => {
    if (customCursorEnabled) {
      hideCursor();
    }
  }, [hideCursor, customCursorEnabled]);

  const handleToggleCustomCursor = useCallback(() => {
    setCustomCursorEnabled(prev => {
      if (prev) {
        hideCursor();
      }
      return !prev;
    });
  }, [hideCursor]);

  const handleCanvasMouseDown = useCallback((event: React.MouseEvent) => {
    if (customCursorEnabled && event.button === 0) { // Left mouse button
      changeCursorState('grab');
    }
  }, [changeCursorState, customCursorEnabled]);

  const handleCanvasMouseUp = useCallback(() => {
    if (customCursorEnabled) {
      changeCursorState('default');
    }
  }, [changeCursorState, customCursorEnabled]);

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent) => {
    if (customCursorEnabled) {
      // Change cursor based on what's being hovered
      if (event.buttons === 1) { // Dragging
        changeCursorState('grabbing');
      } else {
        changeCursorState('default');
      }
    }
  }, [changeCursorState, customCursorEnabled]);

  // Create effective settings with reversed palette applied
  const effectiveSettings = {
    ...effectSettings,
    colors: {
      ...effectSettings.colors,
      ...getEffectivePalette()
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground">
      {/* Clean Top Bar */}
      <div className="bg-background minimal-header px-4 py-3 flex justify-between items-center">
        <div className="mono-title">
          Razi's Dither Tool
        </div>
        <div className="clean-cluster gap-3">
          <Button 
            onClick={handleToggleCustomCursor} 
            variant="outline" 
            size="sm" 
            className={`minimal-button px-3 py-1.5 ${customCursorEnabled ? 'bg-accent' : ''}`}
          >
            Custom Cursor
          </Button>
          <Button 
            onClick={handleResetCamera} 
            variant="outline" 
            size="sm" 
            className="minimal-button px-3 py-1.5"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset camera
          </Button>
          <Button 
            onClick={handleToggleRotation} 
            variant="outline" 
            size="sm" 
            className="minimal-button px-3 py-1.5"
          >
            {autoRotate ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {autoRotate ? 'Stop rotation' : 'Start rotation'}
          </Button>
          <Button 
            onClick={handleExport} 
            size="sm" 
            className="minimal-button-primary px-3 py-1.5"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-row">
        {/* Left Sidebar */}
        <div>
          <ControlPanel
            effectSettings={effectSettings}
            onEffectSettingsChange={handleEffectSettingsChange}
            onFileSelect={handleFileSelect}
            onResetCamera={handleResetCamera}
            onToggleRotation={handleToggleRotation}
            onExport={handleExport}
            autoRotate={autoRotate}
            statusMessage={statusMessage}
            onPresetSelect={handlePresetSelect}
            onPresetPreview={handlePresetPreview}
            onPresetPreviewEnd={handlePresetPreviewEnd}
            onToggleReversePalette={handleToggleReversePalette}
          />
        </div>

        {/* Main Canvas Area */}
        <main className="flex-1 flex items-center justify-center relative p-4 bg-muted border-l-0">
          <div 
            className="minimal-card minimal-shadow-md"
            onMouseEnter={handleCanvasMouseEnter}
            onMouseLeave={handleCanvasMouseLeave}
            onMouseDown={handleCanvasMouseDown}
            onMouseUp={handleCanvasMouseUp}
            onMouseMove={handleCanvasMouseMove}
          >
            <ThreeJSRenderer
              ref={rendererRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              aspectRatio={canvasDimensions.aspectRatio}
              effectSettings={effectiveSettings}
              autoRotate={autoRotate}
              onVideoLoad={handleVideoLoad}
              onImageLoad={handleImageLoad}
            />
          </div>
        </main>
      </div>


      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        onExport={handleExportStart}
        isExporting={isExporting}
        exportProgress={exportProgress}
        canvasWidth={canvasDimensions.width}
        canvasHeight={canvasDimensions.height}
      />

      {/* Custom Cursor */}
      <CustomCursor cursorState={cursorState} isVisible={isCursorVisible && customCursorEnabled} />
    </div>
  );
}