import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "../libs/prisma";
import { compare } from "bcrypt-ts";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) return null;

                const isPasswordValid = await compare(
                    credentials.password as string,
                    user.password
                );

                if (isPasswordValid) {
                    return {
                        id: user.id,
                        name: user.nome,
                        email: user.email,
                    };
                }
                return null;
            },
        }),
    ],
});
