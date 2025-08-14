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
    const router = useRouter();
    const { user, checkAuth } = useAuth();

    useEffect(() => {
        if (user) {
            console.log('✅ User already logged in, redirecting to dashboard');
            router.push('/');
        }
    }, [user, router]);

    const login = async (emailOrUsername, password) => {
        try {
            console.log('🔑 Attempting login...');
            
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailOrUsername, password }),
                credentials: 'include',
            });
            
            const data = await res.json();
            
            console.log('🔑 Login response:', {
                status: res.status,
                ok: res.ok,
                message: data.message,
                hasToken: !!data.token,
                hasUser: !!data.user
            });

            setTimeout(() => {
                console.log('🍪 Cookies after login:', document.cookie);
            }, 500);
            
            return {
                ok: res.ok,
                status: res.status,
                data: data
            };
            
        } catch (error) {
            console.error('❌ Login error:', error);
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
                setMessage('Login berhasil! Mengalihkan...');
                
                setTimeout(async () => {
                    console.log('🔄 Re-checking auth after login...');
                    await checkAuth();
                    
                    setTimeout(() => {
                        console.log('➡️ Redirecting to dashboard...');
                        router.push('/');
                    }, 500);
                }, 1000);
                
            } else {
                const errorMessage = result.data.message || `Login gagal (${result.status})`;
                setMessage(errorMessage);
                console.error('❌ Login failed:', errorMessage);
            }
        } catch (error) {
            console.error('❌ Submit error:', error);
            setMessage('Terjadi kesalahan saat login: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (user) {
        return (
            <div className="min-h-screen flex justify-content-center align-items-center">
                <div className="text-center">
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-3">Already logged in, redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-content-center align-items-center">
            <div className="animated-gradient-bg">
                <div className="card w-10 h-full md:h-30rem">
                    <div className="grid h-full">
                        <div className="col-12 md:col-6 flex flex-col justify-center h-full px-4">
                            <div>
                                <h3 className="text-2xl text-center font-semibold mb-5">
                                    {process.env.NEXT_PUBLIC_APP_NAME || 'Login System'}
                                </h3>
                                
                                <div className="mb-3 text-xs text-500">
                                    Debug: Cookies = {document.cookie ? 'Present' : 'None'}
                                </div>
                                
                                {message && (
                                    <div className={`p-3 mb-3 border-round text-center ${
                                        message.includes('berhasil') 
                                            ? 'bg-green-100 text-green-800 border-green-300' 
                                            : 'bg-red-100 text-red-800 border-red-300'
                                    }`}>
                                        {message}
                                    </div>
                                )}

                                <form className="grid" onSubmit={handleSubmit}>
                                    <div className="col-12">
                                        <label htmlFor="email">Email atau Username</label>
                                        <InputText 
                                            id="emailOrUsername"
                                            type="text"
                                            className="w-full mt-3" 
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
                                    
                                    <div className="col-12">
                                        <label htmlFor="password">Password</label>
                                        <InputText 
                                            id="password"
                                            type="password" 
                                            className="w-full mt-3" 
                                            value={password} 
                                            onChange={(e) => {
                                                setPassword(e.target.value); 
                                                if (message) setMessage('');
                                            }} 
                                            placeholder="Masukkan Password" 
                                            required 
                                            disabled={loading}
                                        />
                                    </div>
                                    
                                    <div className="col-12 mt-3">
                                        <Button 
                                            label={loading ? "Sedang masuk..." : "Login"} 
                                            className="w-full" 
                                            type="submit" 
                                            loading={loading}
                                            disabled={loading}
                                        />
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        <div className="hidden md:block md:col-6 h-full">
                            <img 
                                src="https://preview.redd.it/mas-amba-nyobain-snack-indo-v0-8vfq12nltche1.jpeg?width=554&format=pjpg&auto=webp&s=c76285ad34b29f212ea2731a45298a75255d3b06" 
                                className="w-full h-full object-cover" 
                                alt="cover" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;