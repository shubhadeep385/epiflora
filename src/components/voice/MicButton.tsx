import { Mic, Square } from 'lucide-react';
import { MAX_RECORDING_SECONDS, WARN_AT_SECONDS } from '../../hooks/useRecorder.ts';

interface MicButtonProps {
  isRecording: boolean;
  /** 0-1 input level, drives the reactive ring. */
  level: number;
  seconds: number;
  remainingSeconds: number;
  disabled?: boolean;
  onStart: () => void;
  onStop: () => void;
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * The primary interaction of the whole product.
 *
 * Deliberately oversized: the user is standing in a field, in sunlight, possibly
 * with muddy hands. The ring reacts to input level so it is obvious the mic is
 * live, and the countdown appears in the final seconds because recording stops
 * itself at 25s to stay inside the speech model's limit.
 */
export function MicButton({
  isRecording,
  level,
  seconds,
  remainingSeconds,
  disabled = false,
  onStart,
  onStop,
}: MicButtonProps) {
  // Clamped so a loud noise cannot throw the layout around.
  const ringScale = 1 + Math.min(level, 0.6) * 0.5;
  const nearlyUp = isRecording && remainingSeconds <= WARN_AT_SECONDS;

  return (
    <div className="flex flex-col items-center">
      <div className="relative grid place-items-center">
        {isRecording && (
          <>
            <span
              className="absolute rounded-full bg-forest-400/20 transition-transform duration-75"
              style={{ width: 176, height: 176, transform: `scale(${ringScale})` }}
              aria-hidden="true"
            />
            <span
              className="absolute size-40 animate-ping rounded-full bg-forest-400/15"
              aria-hidden="true"
            />
          </>
        )}

        <button
          type="button"
          onClick={isRecording ? onStop : onStart}
          disabled={disabled}
          aria-label={isRecording ? 'Stop recording' : 'Start recording your question'}
          aria-pressed={isRecording}
          className={[
            'relative grid size-32 place-items-center rounded-full text-white shadow-panel transition-colors duration-200',
            'focus-visible:outline-3 focus-visible:outline-offset-4',
            isRecording
              ? 'bg-risk-high hover:brightness-110'
              : 'bg-forest-700 hover:bg-forest-600 active:bg-forest-800',
            disabled ? 'cursor-not-allowed opacity-55' : '',
          ].join(' ')}
        >
          {isRecording ? (
            <Square className="size-9 fill-current" aria-hidden="true" />
          ) : (
            <Mic className="size-12" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="mt-6 min-h-16 text-center" aria-live="polite">
        {isRecording ? (
          <>
            <p className="flex items-center justify-center gap-2 font-medium text-forest-800">
              <span className="size-2 animate-pulse rounded-full bg-risk-high" aria-hidden="true" />
              Listening…
            </p>
            <p className="mt-1 font-mono text-2xl text-forest-700 tabular-nums">
              {formatClock(seconds)}
            </p>
            {nearlyUp && (
              <p className="mt-1 text-sm text-clay-700">
                {remainingSeconds} second{remainingSeconds === 1 ? '' : 's'} left
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-lg font-medium text-forest-800">Tap to speak</p>
            <p className="mt-1 text-sm text-ink-muted">
              Ask anything about your crop, soil or the weather. Up to{' '}
              {MAX_RECORDING_SECONDS} seconds.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
