import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/LoginPage.css';

export const LoginPage: React.FC = () => {
    const { login, isLoading } = useAuth();
    const [error, setError] = React.useState('');

    const handleLogin = async () => {
        try {
            setError('');
            await login();
        } catch (err: any) {
            setError(err.message || 'Failed to initiate login');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Logo */}
                <div className="login-logo">
                    <div className="logo-icon">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <rect width="48" height="48" rx="12" fill="#3B82F6" />
                            <path d="M16 14h16v4H16v-4zm0 8h16v4H16v-4zm0 8h16v4H16v-4z" fill="white" opacity="0.9" />
                            <path d="M20 18h8v2h-8v-2zm0 8h8v2h-8v-2z" fill="white" />
                        </svg>
                    </div>
                </div>

                {/* Header */}
                <div className="login-header">
                    <h1>Hyperion ETL</h1>
                    <p className="login-subtitle">Sign in to orchestrate your data pipelines</p>
                </div>

                {/* Info Box */}
                <div className="login-info-box">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="info-icon">
                        <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2H9V5zm0 4h2v6H9V9z" fill="#3B82F6" />
                    </svg>
                    <div className="info-text">
                        <span className="info-label">Hyperion ETL now uses <strong>Hyperion IAM</strong> for secure authentication. You will be redirected to the login portal.</span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-banner">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="10" fill="#EF4444" />
                            <path d="M10 6v4m0 4h.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Sign In Button */}
                <button
                    onClick={handleLogin}
                    className="signin-button"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="spinner" width="20" height="20" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="50" strokeDashoffset="25">
                                    <animateTransform attributeName="transform" type="rotate" from="0 10 10" to="360 10 10" dur="1s" repeatCount="indefinite" />
                                </circle>
                            </svg>
                            Connecting...
                        </>
                    ) : (
                        'Sign In with Hyperion IAM'
                    )}
                </button>

                {/* Footer */}
                <div className="login-footer">
                    <span>Protected by <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer">IAM Center</a></span>
                </div>
            </div>
        </div>
    );
};
