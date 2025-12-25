'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    const checkAuth = useCallback(async () => {
    try {
        console.log('AuthContext: Checking authentication...');
        setLoading(true);
        
        const response = await fetch('/api/auth/verify', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Cache-Control': 'no-cache',
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('🔍 Verify response data:', data.user);
            setUser(data.user);
        } else {
            console.log('Auth check failed', response.status);
            setUser(null);
        }
    } catch (error) {
        console.error('Auth check error', error);
        setUser(null);
    } finally {
        setLoading(false);
        setInitialized(true);
    }
}, []);

    const logout = useCallback(async () => {
        try {
            console.log('Starting logout process...');
            
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ AuthContext: Logout successful', result.message);
                
                setUser(null);
                
                
                return { success: true, message: result.message };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Logout failed');
            }
            
        } catch (error) {
            console.error('Logout error', error);
            
            setUser(null);
            
            return { success: false, error: error.message };
        }
    }, []);

    const login = useCallback(async (credentials) => {
        try {
            setLoading(true);
            console.log('Starting login process...');
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('AuthContext: Login successful', data.user?.username);
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }
            
        } catch (error) {
            console.error('AuthContext: Login error', error);
            setUser(null);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!initialized) {
            checkAuth();
        }
    }, [initialized, checkAuth]);

    useEffect(() => {
        console.log(' AuthContext state:', {
            hasUser: !!user,
            loading,
            initialized,
            username: user?.username
        });
    }, [user, loading, initialized]);

    const value = {
        user,
        loading,
        initialized,
        checkAuth,
        logout,
        login,
        setUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};