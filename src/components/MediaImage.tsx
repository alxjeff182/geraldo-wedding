type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  draggable?: boolean;
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
  fetchPriority?: "high" | "low" | "auto";
};

function webpCandidate(src: string): string | null {
  if (/\.jpe?g$/i.test(src) || /\.png$/i.test(src)) {
    return src.replace(/\.(jpe?g|png)$/i, ".webp");
  }
  return null;
}

/** Prefer co-located `.webp` when the source is JPG/PNG. */
export function MediaImage({
  src,
  alt,
  width,
  height,
  className,
  draggable,
  loading = "lazy",
  decoding = "async",
  fetchPriority,
}: Props) {
  const webp = webpCandidate(src);
  const img = (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      draggable={draggable}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
    />
  );
  if (!webp) return img;
  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      {img}
    </picture>
  );
}
