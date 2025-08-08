import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const publicRoutes = [
  { path: '/login', whenAuthenticated: 'redirect' },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = '/login';

const JWT_SECRET = process.env.JWT_SECRET || 'senhaMuitoGrandeParaNaoPerderAbcdjflkjsagdflsagjk';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignora rotas de API e arquivos públicos
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt'
  ) {
    return NextResponse.next();
  }

  const publicRoute = publicRoutes.find(route => route.path === pathname);
  const authToken = request.cookies.get('accessToken');

  // ✅ 1. Rota pública sem token → ok
  if (!authToken && publicRoute) return NextResponse.next();

  // 🚫 2. Rota privada sem token → redirecionar para /login
  if (!authToken && !publicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(url);
  }

  // 🔁 3. Token presente e rota pública → redirecionar para /
  if (authToken && publicRoute?.whenAuthenticated === 'redirect') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // 🔐 4. Token presente e rota privada → validar e setar userData
  if (authToken && !publicRoute) {
    try {
      const { payload } = await jwtVerify(
        authToken.value,
        new TextEncoder().encode(JWT_SECRET)
      );

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const response = NextResponse.next();
      const isProduction = process.env.NODE_ENV === 'production';

      response.cookies.set('userData', base64Payload, {
        httpOnly: false,
        secure: isProduction,
        path: '/',
      });

      return response;
    } catch (error) {
      // ✅ Aqui você limpa o accessToken expirado
      const response = NextResponse.redirect(request.nextUrl.clone());
      const url = request.nextUrl.clone();
      url.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt|_next/static|_next/image|api).*)'],
};
