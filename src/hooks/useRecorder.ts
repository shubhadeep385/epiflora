import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Microphone recording for the Voice Copilot.
 *
 * The 25-second ceiling is a hard product constraint, not a preference: Saaras v3's
 * real-time endpoint rejects audio longer than 30 seconds, so an open-ended mic
 * would fail after the farmer had already said their piece. Recording stops itself
 * with a visible countdown in the last seconds.
 */

/** Below Sarvam's 30s REST limit, with headroom for container overhead. */
export const MAX_RECORDING_SECONDS = 25;
/** When to start warning the farmer that time is nearly up. */
export const WARN_AT_SECONDS = 5;

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'stopped' | 'denied' | 'error';

interface RecorderState {
  status: RecorderStatus;
  seconds: number;
  /** 0-1 input level, for the live meter. */
  level: number;
  blob: Blob | null;
  error: string | null;
}

const INITIAL: RecorderState = {
  status: 'idle',
  seconds: 0,
  level: 0,
  blob: null,
  error: null,
};

/** First supported container. Safari yields mp4; Chrome and Firefox yield webm. */
function pickMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate;
  }
  return '';
}

export function useRecorder() {
  const [state, setState] = useState<RecorderState>(INITIAL);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const capRef = useRef<number | null>(null);

  /** Releases the mic indicator promptly — a hot mic is a trust problem. */
  const teardown = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (tickRef.current !== null) window.clearInterval(tickRef.current);
    if (capRef.current !== null) window.clearTimeout(capRef.current);
    rafRef.current = null;
    tickRef.current = null;
    capRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    void audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    recorderRef.current = null;
  }, []);

  useEffect(() => teardown, [teardown]);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setState({
        ...INITIAL,
        status: 'error',
        error: 'This browser cannot record audio. You can type your question instead.',
      });
      return;
    }

    setState({ ...INITIAL, status: 'requesting' });

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (cause) {
      const denied =
        cause instanceof DOMException &&
        (cause.name === 'NotAllowedError' || cause.name === 'SecurityError');
      setState({
        ...INITIAL,
        status: denied ? 'denied' : 'error',
        error: denied
          ? 'Microphone access was blocked. You can type your question instead.'
          : 'No microphone was found. You can type your question instead.',
      });
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];

    const mimeType = pickMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch {
      recorder = new MediaRecorder(stream);
    }
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      teardown();
      setState((prev) => ({
        ...prev,
        status: 'stopped',
        level: 0,
        blob: blob.size > 0 ? blob : null,
        error: blob.size > 0 ? null : 'Nothing was recorded. Please try again.',
      }));
    };

    recorder.onerror = () => {
      teardown();
      setState((prev) => ({ ...prev, status: 'error', error: 'Recording failed. Please try again.' }));
    };

    // Live level meter, purely so the farmer can see it is listening.
    try {
      const context = new AudioContext();
      audioContextRef.current = context;
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      context.createMediaStreamSource(stream).connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      const sample = () => {
        analyser.getByteTimeDomainData(buffer);
        let peak = 0;
        for (const value of buffer) {
          peak = Math.max(peak, Math.abs(value - 128) / 128);
        }
        setState((prev) => (prev.status === 'recording' ? { ...prev, level: peak } : prev));
        rafRef.current = requestAnimationFrame(sample);
      };
      rafRef.current = requestAnimationFrame(sample);
    } catch {
      // A missing AudioContext costs only the visual meter.
    }

    recorder.start();
    setState({ ...INITIAL, status: 'recording' });

    tickRef.current = window.setInterval(() => {
      setState((prev) => (prev.status === 'recording' ? { ...prev, seconds: prev.seconds + 1 } : prev));
    }, 1000);

    // The hard stop. Without this, Saaras would reject the upload outright.
    capRef.current = window.setTimeout(() => stop(), MAX_RECORDING_SECONDS * 1000);
  }, [stop, teardown]);

  const reset = useCallback(() => {
    teardown();
    setState(INITIAL);
  }, [teardown]);

  return {
    ...state,
    start,
    stop,
    reset,
    remainingSeconds: Math.max(0, MAX_RECORDING_SECONDS - state.seconds),
    isRecording: state.status === 'recording',
    /** True once the mic route is unavailable and typing should be offered. */
    micUnavailable: state.status === 'denied' || state.status === 'error',
  };
}
