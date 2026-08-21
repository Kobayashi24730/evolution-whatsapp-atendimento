import NextAuth from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/libs/prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
    }
}

const getSecret = (): string => {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("FATAL: NEXTAUTH_SECRET não está definida em ambiente de produção.");
        }
        return "dev-fallback-secret-key-change-in-production";
    }
    return secret;
};
export const authOptions = {
    secret: getSecret(),
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
        signIn: "/login",
        error: "/login"
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
                session.user.id = token.id || (token.sub as string);
            }
            return session;
        },
    }
};

const handle = NextAuth(authOptions);
export { handle as GET, handle as POST };