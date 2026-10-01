import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { LocalMachineProvider } from './context/LocalMachineContext';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <LocalMachineProvider>
      <App />
    </LocalMachineProvider>
  </ThemeProvider>
);
