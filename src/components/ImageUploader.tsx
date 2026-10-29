'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 4,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images in total.`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Client-side quick check
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          throw new Error(`File "${file.name}" is not a supported image (JPG, PNG, WEBP only).`);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds the 5MB size limit.`);
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        newUrls.push(data.url);
      }

      onChange([...images, ...newUrls]);
    } catch (err: any) {
      setError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed.`);
      return;
    }

    try {
      new URL(urlInput); // validate url structure
      onChange([...images, urlInput.trim()]);
      setUrlInput('');
      setShowUrlInput(false);
      setError(null);
    } catch {
      setError('Please enter a valid image URL (e.g. https://...)');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
          images.length >= maxImages
            ? 'opacity-60 cursor-not-allowed border-slate-200 bg-slate-50'
            : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50/70 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploading || images.length >= maxImages}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          {uploading ? (
            <div className="flex flex-col items-center py-2">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
              <p className="text-sm font-medium text-slate-700">Verifying and processing image...</p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-2">
                <Upload className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-sm font-semibold text-slate-900">
                Click to upload photographs
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PNG, JPG or WEBP up to 5MB (Max {maxImages} images)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Alternative URL button */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {images.length} of {maxImages} uploaded
        </span>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          {showUrlInput ? 'Hide URL input' : 'Paste image URL instead'}
        </button>
      </div>

      {/* URL Input collapse */}
      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
          >
            Add
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Thumbnails Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {images.map((imgUrl, index) => (
            <div
              key={index}
              className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group"
            >
              <img
                src={imgUrl}
                alt={`Uploaded image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === 0 && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-semibold bg-slate-900/80 text-white rounded">
                  Primary Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
