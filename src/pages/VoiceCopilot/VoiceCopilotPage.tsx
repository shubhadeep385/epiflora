import { useEffect, useState } from 'react';
import { Mic, Check, Loader2, AlertCircle, Send, MapPin, Sprout, Camera } from 'lucide-react';
import { Card, SectionHeading } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { LanguagePicker } from '../../components/voice/LanguagePicker.tsx';
import { MicButton } from '../../components/voice/MicButton.tsx';
import { AnswerCard } from '../../components/voice/AnswerCard.tsx';
import { PhotoAttachment } from '../../components/voice/PhotoAttachment.tsx';
import { useRecorder } from '../../hooks/useRecorder.ts';
import { useVoiceAsk } from '../../hooks/useVoiceAsk.ts';
import { useAppStore } from '../../store/appStore.ts';

/** Staged progress: several network hops need to read as work, not a hang. */
function PipelineProgress({ stage, stages }: { stage: number; stages: readonly string[] }) {
  return (
    <Card className="p-6" aria-live="polite" aria-busy="true">
      <h2 className="font-semibold text-forest-800">Understanding your question</h2>
      <ol className="mt-4 space-y-3">
        {stages.map((label, index) => {
          const done = index < stage;
          const active = index === stage;
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={[
                  'grid size-5 shrink-0 place-items-center rounded-full',
                  done
                    ? 'bg-forest-600 text-white'
                    : active
                      ? 'bg-forest-50 text-forest-600'
                      : 'bg-surface-sunken text-ink-subtle',
                ].join(' ')}
              >
                {done ? (
                  <Check className="size-3" aria-hidden="true" />
                ) : active ? (
                  <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                )}
              </span>
              <span className={done || active ? 'text-ink' : 'text-ink-subtle'}>{label}</span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

export function VoiceCopilotPage() {
  const recorder = useRecorder();
  const voice = useVoiceAsk();

  const location = useAppStore((store) => store.location);
  const primaryCrop = useAppStore((store) => store.primaryCrop);
  const pendingVoiceImage = useAppStore((store) => store.pendingVoiceImage);
  const setPendingVoiceImage = useAppStore((store) => store.setPendingVoiceImage);

  const [typed, setTyped] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  // A photo handed over from Crop Doctor. Claimed once, so returning to this page
  // later does not silently re-attach an old photo.
  useEffect(() => {
    if (pendingVoiceImage) {
      setImage(pendingVoiceImage);
      setPendingVoiceImage(null);
    }
  }, [pendingVoiceImage, setPendingVoiceImage]);

  // Send as soon as a recording lands: the farmer has already indicated intent by
  // pressing stop, so an extra "send" tap would be friction for no gain.
  useEffect(() => {
    if (recorder.status === 'stopped' && recorder.blob) {
      const blob = recorder.blob;
      recorder.reset();
      void voice.ask({ audio: blob, ...(image ? { image } : {}) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.status, recorder.blob]);

  // A blocked microphone reveals the text route rather than dead-ending.
  useEffect(() => {
    if (recorder.micUnavailable) setShowTyping(true);
  }, [recorder.micUnavailable]);

  function submitTyped(event: React.FormEvent) {
    event.preventDefault();
    if (!typed.trim()) return;
    const question = typed.trim();
    setTyped('');
    void voice.ask({ question, ...(image ? { image } : {}) });
  }

  /** Follow-ups keep the photo attached: they are usually about the same plant. */
  function askFollowUp(question: string) {
    voice.reset();
    void voice.ask({ question, ...(image ? { image } : {}) });
  }

  function startOver() {
    voice.reset();
    recorder.reset();
    setTyped('');
    setImage(null);
  }

  const busy = voice.status === 'working';

  return (
    <div className="max-w-2xl space-y-4">
      <SectionHeading
        as="h1"
        icon={Mic}
        title="Ask EpiFlora"
        description="Ask about your crop in your own language, and attach a photo if it helps. Mixing in English words is fine."
      />

      {voice.status === 'done' && voice.result ? (
        <AnswerCard
          result={voice.result}
          image={image}
          onAskAnother={startOver}
          onFollowUp={askFollowUp}
        />
      ) : busy ? (
        <PipelineProgress stage={voice.stage} stages={voice.stages} />
      ) : (
        <>
          <Card className="px-6 py-10">
            <MicButton
              isRecording={recorder.isRecording}
              level={recorder.level}
              seconds={recorder.seconds}
              remainingSeconds={recorder.remainingSeconds}
              disabled={recorder.status === 'requesting'}
              onStart={() => void recorder.start()}
              onStop={recorder.stop}
            />

            {recorder.error && (
              <p role="alert" className="mt-4 text-center text-sm text-clay-700">
                {recorder.error}
              </p>
            )}

            {/* Photo + voice: the combined flow. Placed below the mic so it reads
                as a modifier to the question rather than a competing action. */}
            {!recorder.isRecording && (
              <div className="mt-8 flex justify-center">
                <PhotoAttachment image={image} onChange={setImage} disabled={busy} />
              </div>
            )}

            {/* Typing is always reachable — voice is an addition, not a gate. */}
            {!recorder.isRecording && (
              <div className="mt-8 border-t border-hairline pt-6">
                {showTyping ? (
                  <form onSubmit={submitTyped} className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={typed}
                      onChange={(event) => setTyped(event.target.value)}
                      placeholder="Type your question instead"
                      aria-label="Type your question"
                      className="min-h-11 flex-1 rounded-xl border border-hairline bg-surface px-3 text-base text-ink focus:border-forest-400"
                    />
                    <Button type="submit" disabled={!typed.trim()}>
                      <Send className="size-4" aria-hidden="true" />
                      Ask
                    </Button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowTyping(true)}
                    className="mx-auto block min-h-11 text-sm text-forest-700 underline underline-offset-4"
                  >
                    Or type your question instead
                  </button>
                )}
              </div>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <LanguagePicker />
          </Card>

          {/* What the answer will actually be grounded in. */}
          <Card className="p-5">
            <p className="text-xs font-medium tracking-wide text-ink-subtle uppercase">
              Your answers will consider
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-forest-500" aria-hidden="true" />
                {location?.label ? (
                  <span className="text-ink">
                    {location.label} — live weather and rainfall
                  </span>
                ) : (
                  <span className="text-ink-muted">
                    No location set, so weather cannot be considered
                  </span>
                )}
              </li>
              <li className="flex items-center gap-2.5">
                <Sprout className="size-4 shrink-0 text-forest-500" aria-hidden="true" />
                {primaryCrop ? (
                  <span className="text-ink">{primaryCrop}</span>
                ) : (
                  <span className="text-ink-muted">No crop set yet</span>
                )}
              </li>
              {image && (
                <li className="flex items-center gap-2.5">
                  <Camera className="size-4 shrink-0 text-forest-500" aria-hidden="true" />
                  <span className="text-ink">The photo you attached</span>
                </li>
              )}
            </ul>
          </Card>

          {voice.error && (
            <div
              role="alert"
              className="flex gap-3 rounded-card border border-clay-300 bg-clay-100 p-4"
            >
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-clay-700" aria-hidden="true" />
              <div className="text-sm text-clay-700">
                <p>{voice.error.message}</p>
                {voice.error.retryable && (
                  <p className="mt-1 text-clay-700/80">Please try asking again.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
