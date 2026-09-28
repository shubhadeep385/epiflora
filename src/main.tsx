import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx';
import { useThemeStore, applyTheme } from './store/themeStore.ts';
import './index.css';

// Initialise active theme on page mount
applyTheme(useThemeStore.getState().theme);

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root missing from index.html');

const baseName = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={baseName}>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
