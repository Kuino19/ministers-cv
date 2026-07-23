import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './db';


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-login',
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@church.org' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required.');
        }

        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase().trim() },
          });
        } catch (e) {
          console.error("Prisma error:", e);
          throw new Error('Database connection failed. Please verify your internet connection.');
        }

        if (!user) {
          throw new Error('Invalid email or password.');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email or password.');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    CredentialsProvider({
      id: 'minister-login',
      name: 'Minister Login',
      credentials: {
        name: { label: 'Full Name', type: 'text', placeholder: 'John Doe' },
        credentialNumber: { label: 'Credential Number', type: 'text', placeholder: 'Enter your credential number' },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.credentialNumber) {
          throw new Error('Name and Credential Number are required.');
        }

        const name = credentials.name.trim();
        const credentialNumber = credentials.credentialNumber.trim().toUpperCase();

        const inputCredentialNormalized = credentialNumber.replace(/[^A-Z0-9]/g, '');

        // Validate format removed per user request: allow any format
        // Check if minister exists
        let minister;
        try {
          const allMinisters = await prisma.ministerRecord.findMany();
          minister = allMinisters.find(m => m.credentialNumber.toUpperCase().replace(/[^A-Z0-9]/g, '') === inputCredentialNormalized);
        } catch (e) {
          console.error("Prisma error:", e);
          throw new Error('Database connection failed. Please verify your internet connection or backend status.');
        }

        if (minister) {
          // If exists, verify name very loosely (ignore case, spaces, and punctuation)
          const dbName = minister.name.toLowerCase().replace(/[^a-z]/g, '');
          const inputName = name.toLowerCase().replace(/[^a-z]/g, '');
          if (dbName !== inputName && !dbName.includes(inputName) && !inputName.includes(dbName)) {
            throw new Error('Name does not match our records for this Credential Number.');
          }
        } else {
          // Create new shell record
          try {
            minister = await prisma.ministerRecord.create({
              data: {
                name: name,
                credentialNumber: credentialNumber,
                designation: '', // Required by schema
                status: 'Active', // Default status or empty
              },
            });
          } catch (e) {
            console.error("Prisma create error:", e);
            throw new Error('Failed to register profile. Database connection failed.');
          }
        }

        return {
          id: minister.id,
          name: minister.name,
          role: 'MINISTER',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/', // Default sign in page is the main landing page (Minister Login)
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'ministers-cv-register-secret-key-2026-secure-random',
};
