// app/api/test-redis/route.ts

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export async function GET() {
    try {
        const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });

        await redis.set("teste", "ok");

        const value = await redis.get("teste");

        return NextResponse.json({
            success: true,
            value,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            { status: 500 }
        );
    }
}