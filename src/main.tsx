import { createRoot } from "react-dom/client";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import App from "./app/App.tsx";
import "./styles/index.css";

// Error boundary to catch and display errors
const ErrorBoundary = ({ children, error }: { children: React.ReactNode; error?: Error | unknown }) => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>Application Error</h2>
    <p style={{ color: '#e74c3c', marginBottom: '10px' }}>
      {error?.message || 'An unexpected error occurred'}
    </p>
    <p style={{ fontSize: '14px', color: '#666' }}>
      Please refresh the page. If the problem persists, clear browser cache and restart.
    </p>
  </div>
);

if (document.getElementById("root")) {
  try {
    createRoot(document.getElementById("root")!).render(<App />);
  } catch (error) {
    console.error('Failed to render app:', error);
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h2 style="color: #e74c3c;">Application Failed to Load</h2>
        <p style="color: #666; margin-bottom: 10px;">
          ${error?.message || 'An unexpected error occurred'}
        </p>
        <p style="font-size: 14px; color: #666;">
          Please refresh the page. If the problem persists, clear browser cache and restart.
        </p>
      </div>
    `;
  }
}