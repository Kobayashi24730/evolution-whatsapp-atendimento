import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password ) return null
                const user = await prisma.user.findUnique({
                    where: { email: credentials?.email as string }
                })
                if ( !user || !user.password ) return null
                const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);
                if (isPasswordValid) {
                    return { id: user.id, nome: user.nome, email: user.email }
                }
                return null
            }
        })
    ],
    pages: {
        signIn: "/login"
    }
});