import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import App from './App';
import './styles.css';
import './learning-path.css';
import './sandbox.css';
import './tasks.css';
import './explain.css';
// Stile der Bereiche (src/explain/areas/<bereich>.css) laden sich von selbst; siehe src/explain/AUTHORING.md.
import.meta.glob('./explain/areas/*.css', { eager: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><ReactFlowProvider><App /></ReactFlowProvider></React.StrictMode>,
);
