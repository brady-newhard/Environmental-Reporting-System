// Dev helper: Always set the token in localStorage during development
if (window.location.hostname === 'localhost' && import.meta.env.VITE_DEV_TOKEN) {
  localStorage.setItem('token', import.meta.env.VITE_DEV_TOKEN);
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import localforage from 'localforage';
import { migrateFromLocalStorage } from './utils/draftStorage';

// Configure localforage
window.localforage = localforage;

// Migrate any existing drafts from localStorage to IndexedDB
migrateFromLocalStorage('environmental');

console.log('Starting React application...');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  console.log('Created root:', root);

  root.render(
    // <React.StrictMode>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    // </React.StrictMode>
  );
  console.log('Rendered application');
} else {
  console.error('Root element not found');
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
