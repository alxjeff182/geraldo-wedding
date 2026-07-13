import { useRef, useState } from "react";
import { uploadMediaFile } from "../../lib/storage";

type Props = {
  label: string;
  value: string;
  folder: string;
  accept?: string;
  onChange: (url: string) => void;
};

export function ImageUploader({ label, value, folder, accept = "image/*", onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("Maksimal 10MB. Gunakan WebP untuk ukuran lebih kecil.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const url = await uploadMediaFile(file, folder);
      onChange(url);
    } catch {
      setError("Gagal mengunggah file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-uploader">
      <span className="admin-label">{label}</span>
      {value && (
        <div className="admin-uploader__preview">
          {value.match(/\.(mp4|webm)$/i) ? (
            <video src={value} controls className="admin-uploader__media" />
          ) : value.match(/\.(mp3|mpeg|wav)$/i) ? (
            <audio src={value} controls className="admin-uploader__media" />
          ) : (
            <img src={value} alt="" className="admin-uploader__media" />
          )}
        </div>
      )}
      <div className="admin-uploader__actions">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <button
          type="button"
          className="admin-btn admin-btn--secondary"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Mengunggah..." : "Unggah File"}
        </button>
        <input
          type="url"
          className="admin-input"
          value={value}
          placeholder="atau tempel URL"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {error && <p className="admin-error">{error}</p>}
      <p className="admin-hint">Rekomendasi: WebP untuk foto, MP4 terkompresi untuk video.</p>
    </div>
  );
}
