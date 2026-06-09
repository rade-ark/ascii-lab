import React, { useRef, useState, useCallback } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  statusMessage: string;
}

export function FileUpload({ onFileSelect, statusMessage }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    const validExtensions = ['.obj', '.glb', '.gltf', '.mp4', '.webm', '.mov', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (validExtensions.includes(fileExtension)) {
      onFileSelect(file);
    } else {
      // Could show an error message here
      console.error('Unsupported file format');
    }
  }, [onFileSelect]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
        isDragOver
          ? 'border-blue-400 bg-blue-50 dark:bg-gray-700 dark:border-blue-300'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-blue-300 dark:hover:bg-gray-700'
      }`}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".obj,.glb,.gltf,.mp4,.webm,.mov,.jpg,.jpeg,.png,.gif,.bmp,.webp"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Click or drag a 3D model, image, or video
      </p>

    </div>
  );
}