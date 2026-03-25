import React, { useState } from 'react';
import { Sun, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'login' | 'signup';

const AuthPage: React.FC = () => {
    const { signInWithEmail, signUpWithEmail } = useAuth();
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error } = mode === 'login'
            ? await signInWithEmail(email, password)
            : await signUpWithEmail(email, password, fullName);

        if (error) setError(error.message);
        setIsLoading(false);
    };

    return (
        <div style={{
            display: 'flex', height: '100vh', background: '#F3F4F6',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
        }}>
            <div style={{
                background: '#fff', borderRadius: '16px', padding: '48px',
                width: '100%', maxWidth: '400px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
                    <div style={{
                        padding: '8px', background: '#FEF3C7', borderRadius: '10px',
                        color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Sun size={22} fill="currentColor" strokeWidth={2} />
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>Solary Data</h1>
                </div>

                <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
                    {mode === 'login' ? 'Entrar' : 'Criar conta'}
                </h2>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '32px' }}>
                    {mode === 'login'
                        ? 'Acesse o sistema de relatórios solares.'
                        : 'Configure sua conta operacional.'}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {mode === 'signup' && (
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input
                                type="text"
                                placeholder="Nome completo"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                required
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>
                    )}

                    <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                    </div>

                    {error && (
                        <div style={{ padding: '10px 14px', background: '#FEE2E2', borderRadius: '8px', color: '#DC2626', fontSize: '13px' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            background: '#6366F1', color: '#fff', border: 'none', borderRadius: '8px',
                            padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                            opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.2s',
                        }}
                    >
                        {isLoading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280', marginTop: '28px' }}>
                    {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
                    <button
                        onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                        style={{ background: 'none', border: 'none', color: '#6366F1', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
                    >
                        {mode === 'login' ? 'Criar conta' : 'Entrar'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
