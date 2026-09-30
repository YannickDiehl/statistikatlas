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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><ReactFlowProvider><App /></ReactFlowProvider></React.StrictMode>,
);
