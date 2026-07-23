import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'ministers-cv-register-secret-key-2026-secure-random',
});

export const config = {
  matcher: ['/admin/:path*'],
};
