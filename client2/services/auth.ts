// services/auth.ts
import { getServerSession, type DefaultSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/libs/prisma";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: User;
    }
}

export type User = {
    id: string;
} & DefaultSession['user'];

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwr",
    },
    callbacks: {
        session: ({ session, token }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                },
            },
        },
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        Credentials({
            credentials: {
                email: { label: "E-mail" },
                password: { label: "password" type: "password" },
            },
            authorize(credentials) {
                try {
                    debugger;
                    if (!credentials?.email || !credentials.password) {
                        return null;
                    }
                    const userRepo = new UserRepositoryMemory();
                    const handler = new LoginHandler(userRepo);

                    const user = handler.execute(credentials);
                    if (!user) return null;
                    return {
                        is: user.id,
                        email: user.email,
                        name: user.name,
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],
};

export const authOptions = () => getServerSession(authOptions);
