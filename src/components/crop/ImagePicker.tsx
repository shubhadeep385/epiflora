import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Camera, ImagePlus, X, Loader2 } from 'lucide-react';
import { prepareImage, ImageError, type PreparedImage } from '../../lib/image.ts';

interface ImagePickerProps {
  image: PreparedImage | null;
  onChange: (image: PreparedImage | null) => void;
  disabled?: boolean;
}

/**
 * Photo input for Crop Doctor.
 *
 * `capture="environment"` opens the rear camera directly on a phone, which is
 * the actual primary path — a farmer standing in front of the affected plant.
 * Drag and drop is the desktop convenience, not the main case.
 */
export function ImagePicker({ image, onChange, disabled = false }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function accept(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await prepareImage(file));
    } catch (cause) {
      setError(
        cause instanceof ImageError ? cause.message : 'That image could not be prepared.',
      );
      onChange(null);
    } finally {
      setBusy(false);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    void accept(event.dataTransfer.files[0]);
  }

  function onSelect(event: ChangeEvent<HTMLInputElement>) {
    void accept(event.target.files?.[0]);
    // Allows re-selecting the same file after a clear.
    event.target.value = '';
  }

  if (image) {
    return (
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-card border border-hairline bg-surface-sunken">
          <img
            src={image.dataUrl}
            alt="Crop photo selected for diagnosis"
            className="max-h-80 w-full object-contain"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-forest-900/70 text-white backdrop-blur-sm transition-colors hover:bg-forest-900/85 disabled:opacity-50"
            aria-label="Remove this photo"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <p className="text-xs text-ink-subtle">
          {image.width} × {image.height} px · {Math.round(image.approxBytes / 1024)} KB · resized on
          your device before upload
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          'rounded-card border-2 border-dashed p-6 text-center transition-colors',
          dragging ? 'border-forest-400 bg-forest-50' : 'border-hairline bg-surface',
        ].join(' ')}
      >
        {busy ? (
          <p className="flex min-h-32 items-center justify-center gap-2 text-sm text-ink-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Preparing photo…
          </p>
        ) : (
          <>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-forest-50 text-forest-600">
              <Camera className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-4 font-medium text-forest-800">Photograph the affected leaf</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">
              Fill the frame with one leaf in natural light. Including a healthy leaf alongside the
              affected one improves the assessment.
            </p>

            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-forest-700 px-5 text-sm font-medium text-white transition-colors hover:bg-forest-600 disabled:opacity-55"
              >
                <ImagePlus className="size-4" aria-hidden="true" />
                Choose or take a photo
              </button>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onSelect}
          disabled={disabled}
          className="sr-only"
          aria-label="Crop photo"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-risk-high">
          {error}
        </p>
      )}
    </div>
  );
}
