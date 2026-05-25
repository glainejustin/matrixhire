// Safely patch window.fetch with a getter/setter to prevent the fatal:
// "Uncaught TypeError: Cannot set property fetch of #<Window> which has only a getter"
// in sandboxed iframe environments or under certain extensions.
try {
  const originalFetch = window.fetch;
  let activeFetch = originalFetch;
  Object.defineProperty(window, "fetch", {
    get() {
      return activeFetch;
    },
    set(newFetch) {
      activeFetch = newFetch;
    },
    configurable: true,
    enumerable: true,
  });
} catch (error) {
  console.warn("Safety patch for window.fetch setter failed to execute safely:", error);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
