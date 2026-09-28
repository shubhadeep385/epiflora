import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last-resort UI guard. A crash must still leave the farmer with a readable
 * screen and a way forward, never a white page.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('EpiFlora UI error', error, info.componentStack);
  }

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas p-6">
        <div className="w-full max-w-md rounded-panel bg-surface p-8 shadow-panel">
          <h1 className="text-xl font-semibold text-forest-800">Something went wrong</h1>
          <p className="mt-2 text-ink-muted">
            EpiFlora hit an unexpected problem. Your saved farm information is still stored on this
            device.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest-700 px-5 font-medium text-white transition-colors hover:bg-forest-600"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Reload EpiFlora
          </button>
          <details className="mt-5 text-sm text-ink-subtle">
            <summary className="cursor-pointer">Technical detail</summary>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-surface-sunken p-3 font-mono text-xs">
              {error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
