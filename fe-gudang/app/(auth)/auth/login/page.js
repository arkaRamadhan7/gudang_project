'use client';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/gradient.css';
import { useAuth } from '../../context/authContext.js';

const LoginPage = () => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { user, checkAuth } = useAuth();

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const login = async (emailOrUsername, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailOrUsername, password }),
                credentials: 'include',
            });
            
            const data = await res.json();
                // console.log('🔑 Login response:', {
                // status: res.status,
                // ok: res.ok,
                // message: data.message,
                // hasToken: !!data.token,
                // hasUser: !!data.user
           // });

            setTimeout(() => {
            }, 500);
            
            return {
                ok: res.ok,
                status: res.status,
                data: data
            };
            
        } catch (error) {
            console.error('Login error:', error);
            return { 
                ok: false, 
                status: 500, 
                data: { message: 'Gagal terhubung ke server: ' + error.message } 
            };
        }
    };
   
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        try {
            const result = await login(emailOrUsername, password);
            
            if (result.ok && result.status === 200) {
                setMessage('Login berhasil!');
                
                setTimeout(async () => {
                    await checkAuth();
                    
                    setTimeout(() => {
                        router.push('/');
                    }, 500);
                }, 1000);
                
            } else {
                const errorMessage = result.data.message || `Login gagal (${result.status})`;
                setMessage(errorMessage);
                console.error('Login failed:', errorMessage);
            }
        } catch (error) {
            console.error('Submit error:', error);
            setMessage('Terjadi kesalahan saat login: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (user) {
        return (
            <div className="redirect-screen">
                <div className="redirect-content">
                    <div className="redirect-icon-wrapper">
                        <div className="success-checkmark">
                            <svg className="checkmark" viewBox="0 0 52 52">
                                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                            </svg>
                        </div>
                    </div>
                    
                    <h2 className="redirect-title">Already Logged In!</h2>
                    <p className="redirect-description">You are already authenticated</p>
                    
                    <div className="redirect-loader">
                        <div className="loader-bar"></div>
                    </div>
                    
                    <p className="redirect-subtext">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

      return (
        <div className="animated-gradient-bg">
          
            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>
            <div className="floating-shape shape-3"></div>

            <div className="login-container">
                <div className="login-card">
                    {/* Logo/Icon */}
                    <div className="login-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h3 className="login-title">
                        Selamat Datang
                    </h3>
                    <p className="login-subtitle">
                        Masuk ke akun Anda untuk melanjutkan
                    </p>
                    
                    {/* Message */}
                    {message && (
                        <div className={`message-box ${
                            message.includes('berhasil') 
                                ? 'message-success' 
                                : 'message-error'
                        }`}>
                            <div className="message-icon">
                                {message.includes('berhasil') ? (
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <span>{message}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Email/Username Field */}
                        <div className="form-group">
                            <label htmlFor="emailOrUsername" className="form-label">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="label-icon">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                Email atau Username
                            </label>
                            <div className="input-wrapper">
                                <input
                                    id="emailOrUsername"
                                    type="text"
                                    className="input-field"
                                    value={emailOrUsername}
                                    onChange={(e) => {
                                        setEmailOrUsername(e.target.value);
                                        if (message) setMessage('');
                                    }}
                                    placeholder="Masukkan email atau username"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        
                        {/* Password Field */}
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="label-icon">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                Password
                            </label>
                            <div className="password-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="input-field password-input"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (message) setMessage('');
                                    }}
                                    placeholder="Masukkan password"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn-login"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="spinner" viewBox="0 0 24 24">
                                        <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Logging in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Login</span>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="btn-icon">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="register-link mt-3">
                        <span>Belum punya akun?</span>
                        <a href="#">Daftar sekarang</a>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="login-footer">
                    <p>&copy; 2025 {process.env.NEXT_PUBLIC_APP_NAME || 'Your Company'}. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;