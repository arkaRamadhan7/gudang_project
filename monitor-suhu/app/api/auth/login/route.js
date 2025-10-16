import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '../../api';

export async function POST(req) {
  try {
    const body = await req.json();
    const { emailOrUsername, password } = body;
    
    const res = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailOrUsername, password }),
    });

    const data = await res.json();``
    console.log('Backend response data:', { 
      message: data.message, 
      hasToken: !!data.token,
      hasUser: !!data.user 
    });
    
    if (!res.ok) {
      console.log('Login failed at backend');
      return NextResponse.json(data, { status: res.status });
    }
    
    if (!data.token) {
      console.log(' No token in response');
      return NextResponse.json(
        { message: 'Token tidak ditemukan dalam response' }, 
        { status: 500 }
      );
    }
    
    const response = NextResponse.json(data, { 
      status: res.status,
      headers: {
        'Set-Cookie': `token=${data.token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${365 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
      }
    });
    
    response.cookies.set('token', data.token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    
   
    console.log('Cookie value preview:', data.token.substring(0, 20) + '...');
    
    return response;
    
  } catch (error) {
    console.error('Login route error:', error);
    return NextResponse.json(
      { status: '99', message: 'Internal Server Error: ' + error.message },
      { status: 500 }
    );
  }
}