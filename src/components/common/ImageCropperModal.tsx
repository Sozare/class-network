import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Check, Maximize2 } from 'lucide-react';
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
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [baseScale, setBaseScale] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Viewport dimensions
  const VIEWPORT_SIZE = 300; // 300x300 container
  const CROP_SIZE = 230;     // 230px avatar circle guide

  // Reset state when a new image is provided
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);
      setNaturalSize({ width: 0, height: 0 });
    }
  }, [isOpen, imageSrc]);

  // When image loads, compute base scale so the ENTIRE photo fits without being zoomed in
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const nw = img.naturalWidth || 1;
    const nh = img.naturalHeight || 1;
    setNaturalSize({ width: nw, height: nh });

    // Fit entire photo comfortably inside viewport
    const scaleToFit = Math.min(VIEWPORT_SIZE / nw, VIEWPORT_SIZE / nh);
    setBaseScale(scaleToFit);
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(true);
  };

  // Reset to full view fit
  const handleResetToFit = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
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

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom(prev => Math.min(3.5, Math.max(0.7, parseFloat((prev + delta).toFixed(2)))));
  };

  // Generate cropped output canvas (400x400 high resolution)
  const handleCrop = useCallback(() => {
    if (!imgRef.current || !naturalSize.width || !naturalSize.height) return;

    const img = imgRef.current;
    const outputSize = 400; // 400x400 square for avatar

    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Move to center of output canvas
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // 2. Scale factor from viewport crop size to canvas output size
    const factor = outputSize / CROP_SIZE;
    const totalScale = baseScale * zoom * factor;
    ctx.scale(totalScale, totalScale);

    // 3. Offset in natural image coordinates
    const naturalOffsetX = position.x / (baseScale * zoom);
    const naturalOffsetY = position.y / (baseScale * zoom);
    ctx.translate(naturalOffsetX, naturalOffsetY);

    // 4. Draw natural image centered
    ctx.drawImage(
      img,
      -naturalSize.width / 2,
      -naturalSize.height / 2,
      naturalSize.width,
      naturalSize.height
    );

    // Export as clean JPEG data URL
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedDataUrl);
    onClose();
  }, [naturalSize, baseScale, zoom, rotation, position, CROP_SIZE, onClose, onCropComplete]);

  // Display dimensions of image inside viewport
  const displayWidth = naturalSize.width ? naturalSize.width * baseScale : 0;
  const displayHeight = naturalSize.height ? naturalSize.height * baseScale : 0;

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
          onWheel={handleWheel}
          className="relative mx-auto overflow-hidden rounded-2xl bg-slate-950 cursor-grab active:cursor-grabbing select-none touch-none shadow-inner border border-slate-800"
          style={{ width: `${VIEWPORT_SIZE}px`, height: `${VIEWPORT_SIZE}px` }}
        >
          {imageSrc && (
            <img
              ref={imgRef}
              src={imageSrc}
              alt="در حال برش"
              onLoad={handleImageLoad}
              style={{
                width: displayWidth ? `${displayWidth}px` : 'auto',
                height: displayHeight ? `${displayHeight}px` : 'auto',
                maxWidth: 'none',
                maxHeight: 'none',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
              className="pointer-events-none transition-transform duration-75"
            />
          )}

          {/* Semi-transparent dark overlay around the circular crop guide */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              style={{ width: `${CROP_SIZE}px`, height: `${CROP_SIZE}px` }}
              className="rounded-full ring-2 ring-white/95 shadow-[0_0_0_9999px_rgba(15,23,42,0.6)] relative"
            >
              {/* Subtle guide lines */}
              <div className="absolute inset-0 rounded-full border border-white/30 border-dashed" />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-medium">
          کل عکس نمایش داده شده است. می‌توانید عکس را بکشید یا بزرگ‌نمایی کنید تا چهره درون دایره قرار گیرد.
        </p>

        {/* Zoom & Controls Toolbar */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          {/* Zoom Slider */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(0.7, parseFloat((prev - 0.1).toFixed(2))))}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
              title="کوچک‌نمایی"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="0.7"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-sky-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />

            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(3, parseFloat((prev + 0.1).toFixed(2))))}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
              title="بزرگ‌نمایی"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Helper Buttons: Reset to Fit & Rotate */}
          <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-200/60">
            <button
              type="button"
              onClick={handleResetToFit}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 shadow-2xs transition-colors"
              title="نمایش کل عکس در اندازه استاندارد"
            >
              <Maximize2 className="w-3.5 h-3.5 text-sky-600" />
              <span>نمایش کل عکس</span>
            </button>

            <button
              type="button"
              onClick={handleRotate}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 shadow-2xs transition-colors"
              title="چرخش ۹۰ درجه تصویر"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-600" />
              <span>چرخش ۹۰°</span>
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
