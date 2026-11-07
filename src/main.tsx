// Estilos globais primeiro, para que os estilos dos componentes venham depois na cascata.
import './styles/tokens.css';
import './styles/base.css';
import './styles/print.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ToastProvider } from './components/Toast/ToastProvider';
import { AppDataProvider } from './context/AppDataProvider';

const container = document.getElementById('root');
if (!container) throw new Error('Elemento #root não encontrado.');

createRoot(container).render(
  <StrictMode>
    <AppDataProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AppDataProvider>
  </StrictMode>,
);
