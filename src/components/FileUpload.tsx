import React, { useRef, useState } from 'react';
import { Camera, UploadCloud, X, Check, Eye } from 'lucide-react';
import { DoodleCamera, DoodleSparkle } from './Doodles';

interface FileUploadProps {
  imageFile: File | null;
  imagePreview: string | null;
  onImageSelect: (file: File | null, previewUrl: string | null) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  imageFile,
  imagePreview,
  onImageSelect,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processFile = (file: File) => {
    setErrorMessage(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WEBP, HEIC)');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image is larger than 10MB. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onImageSelect(file, (e.target?.result as string) || null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelect(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#4A4955] flex items-center gap-2">
          <span>Evidence Photo</span>
          <span className="text-xs font-normal text-[#8DA399] bg-[#EBF0ED] px-2 py-0.5 rounded-full">
            Recommended
          </span>
        </label>
        <span className="text-xs text-[#9C9BA8]">PNG, JPG up to 10MB</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {!imagePreview ? (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative group cursor-pointer transition-all duration-300 rounded-[1rem] border-2 border-dashed p-6 text-center
            ${
              isDragging
                ? 'border-[#8DA399] bg-[#8DA399]/10 scale-[1.01]'
                : 'border-[#8DA399]/40 bg-[#FDFBF7] hover:border-[#8DA399] hover:bg-[#8DA399]/5'
            }
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          {/* Subtle hand-drawn doodle accent in top corner */}
          <div className="absolute top-3 right-3 opacity-60 group-hover:opacity-100 transition-opacity">
            <DoodleSparkle className="w-4 h-4 text-[#8DA399]" />
          </div>

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#EBF0ED] flex items-center justify-center text-[#8DA399] group-hover:scale-105 transition-transform duration-300 shadow-xs">
              <DoodleCamera className="w-8 h-8 text-[#8DA399]" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-[#4A4955]">
                <span className="text-[#8DA399] font-semibold underline underline-offset-4 decoration-[#8DA399]/40">
                  Click to take or upload a photo
                </span>{' '}
                or drag & drop
              </p>
              <p className="text-xs text-[#9C9BA8]">
                Clear photos help city repair crews locate and verify faster
              </p>
            </div>

            {/* Quick button badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4EFEB] border border-[#8DA399]/20 text-xs text-[#6B6A75] font-medium group-hover:border-[#8DA399]/50 transition-colors">
              <Camera className="w-3.5 h-3.5 text-[#8DA399]" />
              <span>Browse Camera / Files</span>
            </div>
          </div>
        </div>
      ) : (
        /* Preview Card */
        <div className="relative rounded-[1rem] border border-[#8DA399]/30 bg-white/70 p-3 shadow-xs overflow-hidden transition-all duration-300">
          <div className="flex items-center gap-3">
            {/* Thumbnail */}
            <div
              onClick={() => setShowLightbox(true)}
              className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 cursor-pointer group/thumb border border-[#8DA399]/20 bg-[#F4EFEB]"
            >
              <img
                src={imagePreview}
                alt="Complaint evidence preview"
                className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Eye className="w-5 h-5" />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EBF0ED] text-[#6E867B]">
                  <Check className="w-3 h-3 text-[#8DA399]" />
                  Photo Attached
                </span>
              </div>
              <p className="text-xs font-semibold text-[#4A4955] truncate mt-1">
                {imageFile?.name || 'Attached Incident Image'}
              </p>
              <p className="text-[11px] text-[#9C9BA8]">
                {imageFile ? formatFileSize(imageFile.size) : 'Ready for upload'} • Firebase Storage
              </p>
              <button
                type="button"
                onClick={() => setShowLightbox(true)}
                className="text-[11px] text-[#8DA399] font-medium hover:underline inline-flex items-center gap-1 mt-0.5"
              >
                View full size preview
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1 items-end">
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="w-8 h-8 rounded-full bg-[#F4EFEB] hover:bg-[#FEE2E2] text-[#6B6A75] hover:text-[#DC2626] flex items-center justify-center transition-colors shadow-xs"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => !disabled && fileInputRef.current?.click()}
                disabled={disabled}
                className="text-[11px] text-[#8DA399] hover:text-[#6E867B] font-medium px-2 py-1"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-rose-500 font-medium pl-1 flex items-center gap-1">
          <span>•</span>
          {errorMessage}
        </p>
      )}

      {/* Lightbox Modal */}
      {showLightbox && imagePreview && (
        <div
          onClick={() => setShowLightbox(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-[#FDFBF7] rounded-[1rem] p-4 shadow-xl border border-[#8DA399]/30"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#8DA399]/20">
              <h4 className="text-sm font-semibold text-[#4A4955]">
                {imageFile?.name || 'Attached Evidence Photo'}
              </h4>
              <button
                type="button"
                onClick={() => setShowLightbox(false)}
                className="w-7 h-7 rounded-full bg-[#F4EFEB] hover:bg-[#EBF0ED] flex items-center justify-center text-[#6B6A75]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 rounded-xl overflow-hidden bg-black/5 flex items-center justify-center max-h-[70vh]">
              <img
                src={imagePreview}
                alt="Enlarged complaint evidence"
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="mt-3 flex justify-between items-center text-xs text-[#9C9BA8]">
              <span>Photo ready for civic department verification</span>
              <button
                type="button"
                onClick={() => setShowLightbox(false)}
                className="px-3 py-1 bg-[#8DA399] text-white rounded-lg text-xs font-medium hover:bg-[#7D9489]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
