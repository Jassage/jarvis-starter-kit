// Config Auth.js compatible Edge (utilisee par le middleware).
// Ne pas importer ici Prisma ou bcrypt : ce fichier doit pouvoir tourner sur le runtime Edge.

const PROTECTED_PREFIXES = ['/student', '/teacher', '/admin', '/course', '/quiz', '/certificate'];

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
      if (!needsAuth) return true;
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
