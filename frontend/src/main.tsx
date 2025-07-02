// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './utils/gtm';
import { ToastProvider } from './components/ui/use-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider value={{ toast: () => {} }}>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
