import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { compressImage, uploadToStorage } from "./ImageUpload";

const MAX_SIZE = 10 * 1024 * 1024;

interface Props {
  /** called with the public URLs of every image that uploaded successfully */
  onUploaded: (urls: string[]) => void;
  folder?: string;
  maxWidth?: number;
}

/** Drag & drop (or browse) any number of images at once. */
export default function MultiImageUpload({
  onUploaded,
  folder = "projects",
  maxWidth = 1600,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState("");

  const handleFiles = async (list: FileList | File[]) => {
    const all = Array.from(list);
    const images = all.filter((f) => f.type.startsWith("image/"));
    const problems: string[] = [];
    if (images.length < all.length) {
      problems.push(`${all.length - images.length} non-image file(s) skipped.`);
    }
    const valid = images.filter((f) => {
      if (f.size > MAX_SIZE) {
        problems.push(`${f.name} is larger than 10 MB.`);
        return false;
      }
      return true;
    });
    if (valid.length === 0) {
      setError(problems.join(" ") || "Please choose image files.");
      return;
    }

    setError("");
    setProgress({ done: 0, total: valid.length });
    const urls: string[] = [];
    for (const file of valid) {
      try {
        const blob = await compressImage(file, maxWidth);
        urls.push(await uploadToStorage(blob, folder));
      } catch (err) {
        problems.push(
          `${file.name}: ${err instanceof Error ? err.message : "upload failed"}`,
        );
      }
      setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
    }
    setProgress(null);
    if (urls.length > 0) onUploaded(urls);
    setError(problems.join(" "));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (progress) return;
    void handleFiles(e.dataTransfer.files);
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    if (input.files?.length) void handleFiles(input.files);
    input.value = ""; // allow re-selecting the same files
  };

  const busy = progress !== null;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onPick}
        className="hidden"
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !busy) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
          dragging
            ? "border-ocean-cyan bg-ocean-cyan/10"
            : "border-ocean-cyan/30 bg-ocean-cyan/3 hover:border-ocean-cyan/60 hover:bg-ocean-cyan/6"
        } ${busy ? "cursor-wait opacity-70" : ""}`}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ocean-cyan/30 bg-ocean-dark text-ocean-cyan">
          <UploadCloud size={26} strokeWidth={1.5} />
        </span>
        {busy ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-white">
            Uploading {progress.done} / {progress.total}…
          </p>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-wide text-white">
              Drag &amp; drop images here
            </p>
            <p className="text-xs text-white/50">
              or{" "}
              <span className="text-ocean-cyan underline">
                browse from your device
              </span>{" "}
              · select as many as you like · max 10 MB each
            </p>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
