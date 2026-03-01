import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as uploadApi from './shared/api/uploadApi';

// Делаем uploadApi доступным глобально для использования в компонентах
window.uploadApi = uploadApi;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
