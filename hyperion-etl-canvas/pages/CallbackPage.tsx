import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * OAuth2 Callback Page
 * Handles redirect from OAuth2 server after successful authentication
 */
export const CallbackPage: React.FC = () => {
    const { userManager } = useAuth();

    useEffect(() => {
        // Handle the callback from OAuth2 server
        userManager
            .signinRedirectCallback()
            .then(() => {
                // Redirect to the originally requested page or home
                window.location.href = '/';
            })
            .catch((error) => {
                console.error('Callback error:', error);
                // On error, redirect to login
                window.location.href = '/login';
            });
    }, [userManager]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid rgba(255,255,255,0.3)',
                    borderTop: '4px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                }}></div>
                <h2>Completing sign in...</h2>
                <p style={{ opacity: 0.8 }}>Please wait</p>
                <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        </div>
    );
};
