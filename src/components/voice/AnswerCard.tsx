import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, Quote, RotateCcw, MessageCircleQuestion } from 'lucide-react';
import type { VoiceAnswer } from '../../hooks/useVoiceAsk.ts';
import { Card } from '../ui/Card.tsx';
import { Button } from '../ui/Button.tsx';

interface AnswerCardProps {
  result: VoiceAnswer;
  /** Data URL of the photo the question was asked about, if any. */
  image?: string | null;
  onAskAnother: () => void;
  onFollowUp: (question: string) => void;
}

/**
 * Speaks text with the device's own voice.
 *
 * The terminal fallback for speech output: used when Sarvam has no voice for the
 * language or its credit is spent. Quality is lower, but a farmer who cannot read
 * still hears an answer, which is the entire point of the feature.
 */
function speakWithBrowser(text: string, language: string): SpeechSynthesisUtterance | null {
  if (!('speechSynthesis' in window)) return null;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function AnswerCard({ result, image, onAskAnother, onFollowUp }: AnswerCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const { audio, speakWithBrowser: useBrowserVoice, transcript, answer, provenance } = result;

  // Autoplay the spoken reply: the farmer just spoke a question and is waiting to
  // hear back, so making them press play as well would be needless friction.
  useEffect(() => {
    if (audio && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Browsers may block autoplay; the play button remains available.
        setPlaying(false);
      });
    } else if (useBrowserVoice) {
      const utterance = speakWithBrowser(answer, transcript.language);
      if (utterance) {
        setPlaying(true);
        utterance.onend = () => setPlaying(false);
      }
    }

    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [audio, useBrowserVoice, answer, transcript.language]);

  function toggleAudio() {
    if (audio && audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        void audioRef.current.play();
      }
      return;
    }

    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    } else {
      const utterance = speakWithBrowser(answer, transcript.language);
      if (utterance) {
        setPlaying(true);
        utterance.onend = () => setPlaying(false);
      }
    }
  }

  const canSpeak = Boolean(audio) || useBrowserVoice;

  return (
    <div className="space-y-4">
      {/* What we heard — shown so a mis-hearing is visible, not mysterious.
          The photo sits alongside it, making clear what the answer considered. */}
      {(transcript.text || image) && (
        <Card className="p-5">
          <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-ink-subtle uppercase">
            <Quote className="size-3.5" aria-hidden="true" />
            You asked
          </p>
          <div className="mt-2 flex gap-4">
            {image && (
              <img
                src={image}
                alt="The photo your question was about"
                className="size-16 shrink-0 rounded-lg object-cover"
              />
            )}
            <p className="min-w-0 flex-1 text-ink">{transcript.text}</p>
          </div>
        </Card>
      )}

      <Card elevated className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-6 py-4">
          <h2 className="font-semibold text-forest-800">EpiFlora</h2>

          {canSpeak && (
            <button
              type="button"
              onClick={toggleAudio}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest-50 px-4 text-sm font-medium text-forest-700 transition-colors hover:bg-forest-100"
              aria-label={playing ? 'Pause the spoken answer' : 'Play the spoken answer'}
            >
              {playing ? (
                <Pause className="size-4" aria-hidden="true" />
              ) : (
                <Play className="size-4" aria-hidden="true" />
              )}
              {playing ? 'Pause' : 'Play answer'}
              <Volume2 className="size-4 opacity-60" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          {result.offTopic && (
            <p className="mb-3 text-sm text-clay-700">
              That looks like a question outside farming.
            </p>
          )}
          {/* whitespace-pre-line keeps any paragraph breaks the model produced. */}
          <p className="text-lg leading-relaxed whitespace-pre-line text-ink">{answer}</p>

          {audio && (
            <audio
              ref={audioRef}
              src={audio}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              className="sr-only"
            />
          )}
        </div>

        {result.followUps.length > 0 && (
          <div className="border-t border-hairline px-6 py-5">
            <p className="flex items-center gap-2 text-sm font-medium text-forest-700">
              <MessageCircleQuestion className="size-4" aria-hidden="true" />
              You might also ask
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.followUps.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => onFollowUp(question)}
                  className="min-h-11 rounded-xl bg-surface-sunken px-4 text-left text-sm text-ink-muted transition-colors hover:bg-forest-50 hover:text-forest-700"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-hairline px-6 py-4">
          {result.disclaimer && <p className="text-xs text-ink-subtle">{result.disclaimer}</p>}
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-subtle">
            {provenance.speech && (
              <>
                <span>Heard by {provenance.speech.model}</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span>Answered by {provenance.intelligence.model}</span>
            {provenance.tts ? (
              <>
                <span aria-hidden="true">·</span>
                <span>Spoken by {provenance.tts.model}</span>
              </>
            ) : (
              useBrowserVoice && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-clay-700">device voice</span>
                </>
              )
            )}
          </p>
        </div>
      </Card>

      <Button onClick={onAskAnother} variant="secondary">
        <RotateCcw className="size-4" aria-hidden="true" />
        Ask another question
      </Button>
    </div>
  );
}
