import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to initialize app:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: system-ui; max-width: 600px; margin: 50px auto;">
      <h1 style="color: #dc2626;">Initialization Error</h1>
      <p>The application failed to start. Please check the console for details.</p>
      <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
