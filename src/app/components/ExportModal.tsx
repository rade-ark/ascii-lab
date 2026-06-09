import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'png' | 'mp4', scale: number) => void;
  isExporting: boolean;
  exportProgress: number;
  canvasWidth: number;
  canvasHeight: number;
}

const scaleOptions = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
  { value: 3, label: '3x' },
  { value: 4, label: '4x' },
];

export function ExportModal({ isOpen, onClose, onExport, isExporting, exportProgress, canvasWidth, canvasHeight }: ExportModalProps) {
  const [format, setFormat] = useState<'png' | 'mp4'>('png');
  const [scale, setScale] = useState(1);

  const handleExport = () => {
    onExport(format, scale);
  };

  const scaledWidth = Math.round(canvasWidth * scale);
  const scaledHeight = Math.round(canvasHeight * scale);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Canvas
          </DialogTitle>
          <DialogDescription>
            Choose the format and scale for your canvas export.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="format" className="text-sm font-medium">Format</Label>
            <Select value={format} onValueChange={(value: 'png' | 'mp4') => setFormat(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG Image</SelectItem>
                <SelectItem value="mp4">MP4 Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="scale" className="text-sm font-medium">Scale</Label>
            <Select value={scale.toString()} onValueChange={(value) => setScale(parseFloat(value))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scaleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Export Size</Label>
            <div className="mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-sm">
              {scaledWidth} × {scaledHeight} pixels
            </div>
          </div>

          {format === 'mp4' && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Video will be 5 seconds long with smooth rotation
            </div>
          )}

          {isExporting && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Exporting... {Math.round(exportProgress)}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="flex-1"
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              className="flex-1"
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              Export {format.toUpperCase()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}