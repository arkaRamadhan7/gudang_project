import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { profile } from 'console';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    console.log('Token dari cookie:', token ? 'Ada' : 'Tidak ada');
    
    if (!token) {
      return NextResponse.json(
        { message: 'Tidak ada token' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('🔍 Isi decoded token:', decoded);
    
    return NextResponse.json({
      ok: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role,
        no_hp: decoded.no_hp ,
        profile_image: decoded.profile_image
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { message: 'Token tidak valid' },
      { status: 401 }
    );
  }
}