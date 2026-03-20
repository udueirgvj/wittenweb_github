import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminPanel from './AdminPanel';

const isAdmin = window.location.pathname.startsWith('/admin');
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(isAdmin ? <AdminPanel /> : <App />);
