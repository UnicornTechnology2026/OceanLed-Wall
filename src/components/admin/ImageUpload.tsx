import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';

// Resize + compress so it fits in localStorage
function fileToDataUrl(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas is not supported'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

interface ImageUploadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  previewClass?: string;
  maxWidth?: number;
}

export default function ImageUpload({
  value,
  onChange,
  previewClass = 'h-32 w-full',
  maxWidth = 1200,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large (max 10 MB).');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const dataUrl = await fileToDataUrl(file, maxWidth);
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
      input.value = ''; // allow re-selecting the same file
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className={`${previewClass} object-cover rounded-xl border border-white/10`}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white/80 hover:text-red-400 transition-colors"
            title="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-ocean-cyan/40 bg-ocean-cyan/5 px-4 py-2 text-sm text-ocean-cyan hover:bg-ocean-cyan/10 transition-colors disabled:opacity-50"
      >
        <Upload size={14} />
        {loading ? 'Processing…' : value ? 'Change Image' : 'Choose from Device'}
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}