import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '../../api';

export async function POST(req) {
  try {
    const body = await req.json();
    const { emailOrUsername, password } = body;
    
    // console.log('🔐 Login attempt for:', emailOrUsername);
    
    const res = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailOrUsername, password }),
    });

    const data = await res.json();
    
    // console.log('📦 Backend response:', { 
    //   status: res.status,
    //   message: data.message, 
    //   hasToken: !!data.token,
    //   hasUser: !!data.user 
    // });
    
    if (!res.ok) {
      // console.log('❌ Login failed at backend');
      return NextResponse.json(data, { status: res.status });
    }
    
    if (!data.token) {
      // console.log('⚠️ No token in response');
      return NextResponse.json(
        { message: 'Token tidak ditemukan dalam response' }, 
        { status: 500 }
      );
    }
    
    // Create successful response
    const response = NextResponse.json(
      {
        success: true,
        message: data.message || 'Login berhasil',
        user: data.user,
        token: data.token
      }, 
      { status: 200 }
    );

    // Set cookie using NextResponse API
    response.cookies.set('token', data.token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      // Session cookie (expires when browser closes)
      // Or add maxAge for persistent cookie:
      // maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    // console.log('✅ Login successful, cookie set');
    return response;
    
  } catch (error) {
    // console.error('❌ Login route error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal Server Error: ' + error.message 
      },
      { status: 500 }
    );
  }
}
