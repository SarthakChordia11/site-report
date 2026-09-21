import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { EstimatorPage } from './components/estimator/EstimatorPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const path = window.location.pathname.replace(/\/+$/, '') || '/';
const Root = path === '/estimator' ? EstimatorPage : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </StrictMode>,
);
