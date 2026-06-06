import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/libs/prisma";
import * as bcrypt from "bcrypt-ts";

console.log("bcrypt", bcrypt);


export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials){
                if(!credentials?.email || !credentials?.password) return null;
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });
                if (!user || !user.password) return null;
                const passwordMatch = bcrypt.compareSync(credentials.password as string, user.password);
                if(!passwordMatch) return null;
                return {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                };
            },
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        async session({ session, token }) {
            if (session.user) session.user.id = token.id as string;
            return session
        },
    },
});