import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        console.log('🔓 Logout request received');

        // Create success response
        const response = NextResponse.json(
            { 
                success: true,
                message: 'Logout berhasil' 
            }, 
            { status: 200 }
        );

        // Clear token cookie - MUST match login cookie settings
        response.cookies.set('token', '', {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 0, // Expire immediately
            expires: new Date(0) // Set to epoch time (Jan 1, 1970)
        });

        console.log('✅ Logout successful, cookie cleared');
        return response;

    } catch (error) {
        console.error('❌ Logout API error:', error);
        
        return NextResponse.json(
            { 
                success: false,
                message: 'Logout gagal: ' + error.message 
            }, 
            { status: 500 }
        );
    }
}
