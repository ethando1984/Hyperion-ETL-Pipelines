import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserManager, UserManagerSettings } from 'oidc-client-ts';

interface AuthContextType {
    user: User | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
    userManager: UserManager;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

// OIDC Configuration for Hyperion IAM
const oidcConfig: UserManagerSettings = {
    // IAM Base URL - adjust based on your setup
    authority: 'http://localhost:8080',

    // Metadata endpoints - MANUAL CONFIGURATION
    metadata: {
        authorization_endpoint: 'http://localhost:8080/oauth2/authorize',
        token_endpoint: 'http://localhost:8080/oauth2/token',
        userinfo_endpoint: 'http://localhost:8080/oauth2/userinfo',
        end_session_endpoint: 'http://localhost:8080/oauth2/logout',
        jwks_uri: "http://localhost:8080/oauth2/jwks",
    },

    client_id: 'hyperion-cms',
    client_secret: "cms-secret",
    redirect_uri: window.location.origin + '/callback',
    post_logout_redirect_uri: window.location.origin,
    response_type: 'code',
    scope: "openid profile email read write",

    // PKCE for SPA security (still enabled even with client_secret)


    // Token management
    automaticSilentRenew: true, // Disable until IAM supports it
    silent_redirect_uri: window.location.origin + '/silent-renew',

    // User info
    loadUserInfo: false, // Disable if endpoint not available
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [userManager] = useState(() => new UserManager(oidcConfig));
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load existing user session
        userManager.getUser().then((loadedUser) => {
            setUser(loadedUser);
            setIsLoading(false);
        }).catch((error) => {
            console.error('Error loading user:', error);
            setIsLoading(false);
        });

        // Listen for user loaded events
        const handleUserLoaded = (loadedUser: User) => {
            console.log('User loaded:', loadedUser);
            setUser(loadedUser);
            setIsLoading(false);
        };

        const handleUserUnloaded = () => {
            console.log('User unloaded');
            setUser(null);
        };

        const handleAccessTokenExpiring = () => {
            console.log('Access token expiring...');
        };

        const handleAccessTokenExpired = () => {
            console.log('Access token expired');
            setUser(null);
        };

        const handleSilentRenewError = (error: Error) => {
            console.error('Silent renew error:', error);
        };

        // Subscribe to events
        userManager.events.addUserLoaded(handleUserLoaded);
        userManager.events.addUserUnloaded(handleUserUnloaded);
        userManager.events.addAccessTokenExpiring(handleAccessTokenExpiring);
        userManager.events.addAccessTokenExpired(handleAccessTokenExpired);
        userManager.events.addSilentRenewError(handleSilentRenewError);

        // Cleanup
        return () => {
            userManager.events.removeUserLoaded(handleUserLoaded);
            userManager.events.removeUserUnloaded(handleUserUnloaded);
            userManager.events.removeAccessTokenExpiring(handleAccessTokenExpiring);
            userManager.events.removeAccessTokenExpired(handleAccessTokenExpired);
            userManager.events.removeSilentRenewError(handleSilentRenewError);
        };
    }, [userManager]);

    const login = async () => {
        try {
            console.log('Starting login redirect...');
            await userManager.signinRedirect();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await userManager.signoutRedirect();
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        isAuthenticated: !!user && !user.expired,
        isLoading,
        userManager,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
