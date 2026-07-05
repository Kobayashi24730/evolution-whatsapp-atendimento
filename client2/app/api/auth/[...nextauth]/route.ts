import NextAuth from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/libs/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET || "defaultSecret",
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                name: { type: "text", label: "Name" },
                email: { type: "text", label: "Email"},
                password: { type: "password", label: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });
                if(!user) {
                    throw new Error("No user found");
                }
                if (!user.password) return null;
                const isPasswordValid = await bcrypt.compare(credentials.password.trim(), user.password);
                if (!isPasswordValid) {
                    throw new Error("Password invalid");
                }
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            }
        })
    ],
    pages: {
        signIn: "/auth/login",
        error: "/auth/login"
    },
    session: { strategy: "jwt" as const },
    callbacks: {
        async jwt({ token, user }: {token: JWT, user?: any}) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token}: { session: Session, token: JWT }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
            }
            return session;
        },
    }
};

const handle = NextAuth(authOptions);
export { handle as GET, handle as POST };