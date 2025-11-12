import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ROUTE_CONFIG = {
    protected: [
        '/',
        '/dashboard',
        '/master',
        '/kode',        
        '/laporan',
        '/penjualan',
    ],
    
    public: [
        '/auth/login',
        '/unauthorized',
    ],
    
    apiExcluded: [
        '/api/auth/login',
    ]
};

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.') ||
        pathname.startsWith('/images') ||
        pathname.startsWith('/icons') ||
        ROUTE_CONFIG.apiExcluded.some(route => pathname.startsWith(route))
    ) {
        return NextResponse.next();
    }
    if (pathname.startsWith('/api')) {
        return await handleApiRoute(request, pathname);
    }
    return await handlePageRoute(request, pathname);
}

async function handlePageRoute(request, pathname) {
    const isPublicRoute = ROUTE_CONFIG.public.some(route => pathname.startsWith(route));
    if (isPublicRoute) {
        const token = request.cookies.get('token')?.value;
        if (token && pathname.startsWith('/auth/login')) {
            try {
                const secret = new TextEncoder().encode(process.env.JWT_SECRET);
                await jwtVerify(token, secret);
                console.log('middleware: sudah login');
                return NextResponse.redirect(new URL('/', request.url));
            } catch (error) {
                console.log('middleware: token tidak valid');
            }
        }
        
        return NextResponse.next();
    }

    const isProtectedRoute = ROUTE_CONFIG.protected.some(route => {
        if (route === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(route);
    });

    if (!isProtectedRoute) {
        return NextResponse.next();
    }
    
    const token = request.cookies.get('token')?.value;

    if (!token) {
        console.log('middleware: token tidak ditemukan, redirecting to login');
        return redirectToLogin(request, pathname);
    }
    
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        console.log('Token valid untuk user:', payload.username, 'Role:', payload.role);
        
        const roleAccess = checkRoleAccess(pathname, payload.role);
        if (!roleAccess.allowed) {
            console.log('middleware: Role access denied:', roleAccess.reason);
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        
        const response = NextResponse.next();
        response.headers.set('x-user-id', payload.id.toString());
        response.headers.set('x-user-role', payload.role);
        response.headers.set('x-user-email', payload.email);
        
        return response;
        
    } catch (error) {        
        console.error('middleware: Token verification failed:', error.message);
        const response = redirectToLogin(request, pathname);
        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/'
        });
        
        return response;
    }
}

async function handleApiRoute(request, pathname) {
    const protectedApiRoutes = [
        '/api/auth/verify',
        '/api/auth/logout',
        '/api/users',
        '/api/stock',
        '/api/rak',
        '/api/satuan',
        '/api/gudang',
        '/api/kirimbarang',
        '/api/terimabarang',
        '/api/golonganstock',
        '/api/laporan',
        '/api/jenis-gudang',
        '/api/penjualan'
    ];

    const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));
    
    if (!isProtectedApi) {
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;
    
    if (!token) {
        console.log('middleware: api request without token');
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        
        const roleAccess = checkApiRoleAccess(pathname, payload.role, request.method);
        if (roleAccess && !roleAccess.allowed) {
            console.log('middleware: API Access Denied:', roleAccess.reason);
            return new Response(JSON.stringify({
                error: 'Forbidden',
                message: roleAccess.reason,
            }), {
                status: 403,
                headers: {'Content-Type': 'application/json'}
            });
        }
        
        const response = NextResponse.next();
        response.headers.set('x-user-id', payload.id.toString());
        response.headers.set('x-user-role', payload.role);
        
        return response;
        
    } catch (error) {
        console.error('middleware: API token verification failed:', error.message);
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function checkRoleAccess(pathname, userRole) {
    try {
        const roleRules = {
            '/master/user': ['superadmin'], 
            '/master/users': ['superadmin'], 
            
        };

        for (const [route, allowedRoles] of Object.entries(roleRules)) {
            if (pathname.startsWith(route)) {
                if (!allowedRoles.includes(userRole)) {
                    return {
                        allowed: false,
                        reason: `Role '${userRole}' tidak diijinkan untuk '${route}'. Required: ${allowedRoles.join(', ')}`
                    };
                }
            }
        }

        return { allowed: true };
    } catch (error) {
        console.error('Error in checkRoleAccess:', error);
        return { allowed: true };
    }
}

function checkApiRoleAccess(pathname, userRole, method) {
    try {
        const readOnlyMethods = ['GET', 'HEAD', 'OPTIONS'];
        const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        
        const apiRoleRules = {
            'superadmin': { 
                patterns: [
                    '/api/users',
                    '/api/master/user',
                    '/api/master/gudang',   
                    '/api/master/stock',      
                    '/api/kirimbarang',     
                    '/api/terimabarang',    
                    '/api/rak',             
                    '/api/satuan',         
                    '/api/golonganstock',
                    '/api/jenis-gudang'
                ],
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] 
            },

            'admin': {
                patterns: [  
                    '/api/master/stock',      
                    '/api/kirimbarang',     
                    '/api/terimabarang',  
                    '/api/kartustock',  
                    ],
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] 
            },

            'admin': {
                patterns: [  
                    '/api/rak',             
                    '/api/satuan',         
                    '/api/golonganstock',   
                    '/api/gudang',
                    '/api/jenis-gudang'
                    ],
                methods: ['GET'] 
            },
            
            'user,admin,superadmin': {
                patterns: [
                    '/api/auth/verify',     
                    '/api/auth/logout',     
                    '/api/dashboard'       
                ],
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] 
            },

            'user': {
                patterns: [
                    '/api/master/gudang',   
                    '/api/master/stock',      
                    '/api/kirimbarang',     
                    '/api/terimabarang',    
                    '/api/rak',             
                    '/api/satuan',         
                    '/api/golonganstock', 
                    '/api/jenis-gudang'
                ],
                methods: ['GET']
            },

            'admin gudang':{
                patterns: [
                    '/api/kirimbarang',
                    '/api/terimabarang',
                    '/api/request-stock',
                    '/api/stock',
                    '/api/gudang',
                    '/api/jenis-gudang',
                    '/api/nama-gudang'
                ], methods:['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
            },

            'kasir': {
                patterns: [
                    '/api/penjualan'
                ], methods:['GET','POST']
            },
            
            
        };

        for (const [allowedRoles, config] of Object.entries(apiRoleRules)) {
            const roles = allowedRoles.split(',');
            const matchedPattern = config.patterns.find(pattern => pathname.startsWith(pattern));
            
            if (matchedPattern) {
                if (!roles.includes(userRole)) {
                    continue; 
                }
                
                if (!config.methods.includes(method)) {
                    return {
                        allowed: false,
                        reason: `Role '${userRole}' tidak bisa menambah/merubah/menghapus data, Hanya bisa melihat senyum mu yang manis`
                    };
                }
                
                return { allowed: true }; 
            }
        }

        return { allowed: true }; 
        
    } catch (error) {
        console.error('Error in checkApiRoleAccess:', error);
        return { allowed: true }; 
    }
}

function redirectToLogin(request, pathname) {
    const loginUrl = new URL('/auth/login', request.url);
    
    if (pathname !== '/') {
        loginUrl.searchParams.set('redirect', pathname);
    }
    
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|images|icons|.*\\..*?).*)',
    ],
};