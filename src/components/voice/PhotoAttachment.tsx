import { useRef, useState, type ChangeEvent } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { prepareImage, ImageError } from '../../lib/image.ts';

interface PhotoAttachmentProps {
  /** Data URL of the attached photo, or null. */
  image: string | null;
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
}

/**
 * Optional photo alongside a spoken question — the combined flow from Phase 2 §15.
 *
 * Compact by design: on this screen the microphone is the hero and the photo is a
 * modifier, so this must not compete with it. The full-size uploader lives in Crop
 * Doctor, where the photo *is* the subject.
 *
 * Images are downscaled on the device before upload, same as Crop Doctor, because
 * vision tokens are the expensive part of a metered free tier.
 */
export function PhotoAttachment({ image, onChange, disabled = false }: PhotoAttachmentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const prepared = await prepareImage(file);
      onChange(prepared.dataUrl);
    } catch (cause) {
      setError(cause instanceof ImageError ? cause.message : 'That photo could not be prepared.');
    } finally {
      setBusy(false);
    }
  }

  function onSelect(event: ChangeEvent<HTMLInputElement>) {
    void accept(event.target.files?.[0]);
    event.target.value = '';
  }

  if (image) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-forest-50 p-3">
        <img
          src={image}
          alt="Photo attached to your question"
          className="size-14 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-forest-800">Photo attached</p>
          <p className="text-xs text-ink-muted">
            Your spoken question will be answered about this photo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          disabled={disabled}
          aria-label="Remove the attached photo"
          className="grid size-9 shrink-0 place-items-center rounded-full text-forest-700 transition-colors hover:bg-forest-100 disabled:opacity-50"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || busy}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-surface-sunken px-4 text-sm font-medium text-forest-700 transition-colors hover:bg-forest-50 disabled:opacity-55"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Camera className="size-4" aria-hidden="true" />
        )}
        {busy ? 'Preparing photo…' : 'Add a photo to your question'}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onSelect}
        disabled={disabled}
        className="sr-only"
        aria-label="Attach a crop photo"
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-risk-high">
          {error}
        </p>
      )}
    </div>
  );
}
