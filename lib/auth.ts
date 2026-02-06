import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db, { initializeDb } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Correo electrónico',
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await initializeDb();
        const user = await db.get<{ id: string; email: string; name: string; password_hash: string; image: string }>(
          'SELECT id, email, name, password_hash, image FROM users WHERE email = ?',
          credentials.email
        );

        if (!user || !user.password_hash) return null;

        const valid = await compare(credentials.password, user.password_hash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await initializeDb();
        const existing = await db.get<{ id: string }>('SELECT id FROM users WHERE email = ?', user.email!);
        if (!existing) {
          const id = uuid();
          await db.run(
            'INSERT INTO users (id, email, name, image, provider) VALUES (?, ?, ?, ?, ?)',
            id, user.email, user.name, user.image, 'google'
          );
          user.id = id;
        } else {
          user.id = existing.id;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
