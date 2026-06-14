import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker with network-first strategy (always checks online first)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/MazdooriApp/sw.js')
      .then(reg => {
        // Check for a new SW version on every page load
        reg.update();
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing;
          newSW?.addEventListener('statechange', () => {
            if (newSW.state === 'activated') {
              window.location.reload();
            }
          });
        });
      })
      .catch(err => console.warn('SW registration failed:', err));
  });
}
