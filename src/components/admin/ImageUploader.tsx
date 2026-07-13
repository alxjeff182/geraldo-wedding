import { useRef, useState } from "react";
import { validateMediaFile, type MediaSpec } from "../../config/media-specs";
import { uploadMediaFile } from "../../lib/storage";

type Props = {
  label: string;
  value: string;
  folder: string;
  accept?: string;
  spec?: MediaSpec;
  onChange: (url: string) => void;
};

export function ImageUploader({ label, value, folder, accept = "image/*", spec, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setWarning(null);

    const fallbackMax = 10 * 1024 * 1024;
    const maxBytes = spec?.maxBytes ?? fallbackMax;
    const maxLabel = spec?.maxSize ?? "10 MB";

    if (file.size > maxBytes) {
      setError(`Maksimal ${maxLabel}. Kompres file terlebih dahulu.`);
      return;
    }

    if (spec) {
      const validationError = await validateMediaFile(file, spec);
      if (validationError) {
        setWarning(`${validationError} Upload tetap dilanjutkan — pertimbangkan resize agar tampilan optimal.`);
      }
    }

    setUploading(true);

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
      {spec && (
        <div className="admin-uploader__spec">
          <p className="admin-uploader__spec-line">
            <strong>Ukuran</strong> {spec.dimensions}
          </p>
          <p className="admin-uploader__spec-line">
            <strong>Rasio</strong> {spec.ratio} · <strong>Maks</strong> {spec.maxSize} ·{" "}
            <strong>Format</strong> {spec.formats}
          </p>
          {spec.notes && <p className="admin-uploader__spec-note">{spec.notes}</p>}
        </div>
      )}
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
            e.target.value = "";
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
      {warning && <p className="admin-uploader__warning">{warning}</p>}
      {error && <p className="admin-error">{error}</p>}
      {!spec && (
        <p className="admin-hint">Rekomendasi: WebP untuk foto, MP4 terkompresi untuk video. Maks. 10 MB.</p>
      )}
    </div>
  );
}
