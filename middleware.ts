import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' },
});

export const config = {
  matcher: ['/crear/:path*', '/generando/:path*', '/cuento/:path*', '/biblioteca/:path*', '/perfil/:path*'],
};
