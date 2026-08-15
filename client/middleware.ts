import rateLimit from "@/libs/rate-limit";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export default withAuth(
    async function middleware(request: NextRequest) {
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("cf-connecting-ip") ||
            "127.0.0.1";

        const { success } = await rateLimit.limit(ip);
        if (!success) {
            return NextResponse.json(
                { message: "Too many requests" },
                { status: 429 }
            );
        }
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = { matcher: ["/atendimento", "/dashboard", "/procurar", "/configuracoes"] };