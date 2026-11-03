import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Check } from 'lucide-react';
import { Modal } from './Modal';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const CROP_SIZE = 260; // 260x260 viewport

  // Reset state when a new image is loaded
  useEffect(() => {
    if (isOpen && imageSrc) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [isOpen, imageSrc]);

  // Center image on load
  const handleImageLoad = () => {
    setImageLoaded(true);
    setPosition({ x: 0, y: 0 });
  };

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Generate cropped output canvas
  const handleCrop = useCallback(() => {
    if (!imgRef.current) return;

    const img = imgRef.current;
    const outputSize = 400; // High quality 400x400 square for avatar

    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Smooth rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Move to center of canvas
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate ratio from viewport (260px) to output canvas (400px)
    const factor = outputSize / CROP_SIZE;

    // Apply scale and position adjusted for output size
    ctx.scale(scale * factor, scale * factor);
    ctx.translate(position.x / scale, position.y / scale);

    // Draw image centered
    ctx.drawImage(
      img,
      -img.naturalWidth / 2,
      -img.naturalHeight / 2,
      img.naturalWidth,
      img.naturalHeight
    );

    // Export as clean JPEG data URL
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
    onCropComplete(croppedDataUrl);
    onClose();
  }, [rotation, scale, position, onClose, onCropComplete]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تنظیم و برش تصویر پروفایل"
      maxWidth="md"
    >
      <div className="space-y-4 text-center">
        {/* Crop Viewport */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="relative mx-auto overflow-hidden rounded-2xl bg-slate-900 cursor-grab active:cursor-grabbing select-none touch-none shadow-inner"
          style={{ width: `${CROP_SIZE}px`, height: `${CROP_SIZE}px` }}
        >
          {imageSrc && (
            <img
              ref={imgRef}
              src={imageSrc}
              alt="در حال برش"
              onLoad={handleImageLoad}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                transformOrigin: 'center center',
                maxWidth: 'none',
                maxHeight: 'none',
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: imgRef.current ? -imgRef.current.naturalHeight / 2 : 0,
                marginLeft: imgRef.current ? -imgRef.current.naturalWidth / 2 : 0,
              }}
              className="pointer-events-none transition-transform duration-75"
            />
          )}

          {/* Circular mask overlay */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-white/30 rounded-full shadow-[0_0_0_9999px_rgba(15,23,42,0.65)]" />

          {/* Grid lines guide */}
          <div className="pointer-events-none absolute inset-0 rounded-full border border-white/20 border-dashed" />
        </div>

        <p className="text-[11px] text-slate-500 font-medium">
          تصویر را با ماوس یا لمس جابه‌جا کنید تا چهره در دایره تنظیم شود.
        </p>

        {/* Zoom & Rotation Controls */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
              title="کوچک‌نمایی"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />

            <button
              type="button"
              onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
              title="بزرگ‌نمایی"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleRotate}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1 shrink-0"
              title="چرخش ۹۰ درجه"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>چرخش</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
          >
            انصراف
          </button>

          <button
            type="button"
            disabled={!imageLoaded}
            onClick={handleCrop}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-xs disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>تایید و برش عکس</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
