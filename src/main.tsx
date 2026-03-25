import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AuthPage from './pages/AuthPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

const AppRouter: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: '#6B7280', fontSize: '14px' }}>Carregando...</p>
            </div>
        </div>
    );

    return user ? <App /> : <AuthPage />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    </React.StrictMode>
);
