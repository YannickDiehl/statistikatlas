import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import App from './App';
import './styles.css';
import './components/explore/explore.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><ReactFlowProvider><App prototype={(new URLSearchParams(location.search).get('ansicht')??document.documentElement.dataset.atlasView)==='prototyp'} /></ReactFlowProvider></React.StrictMode>,
);
