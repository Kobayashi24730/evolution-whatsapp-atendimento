import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/services/auth.config";
import { prisma } from "@/libs/prisma";
import * as bcrypt from "bcrypt-ts";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,

    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email as string
                    }
                });

                if (!user) return null;

                const validPassword = bcrypt.compareSync(
                    credentials.password as string,
                    user.password
                );

                if (!validPassword) return null;

                return {
                    id: user.id,
                    name: user.nome,
                    email: user.email
                };
            }
        })
    ]
});