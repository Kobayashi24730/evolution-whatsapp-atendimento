'use client';

import { useState, useEffect, useCallback } from "react";
import { HomeStats } from "@/types/types";

export function useHome() {
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<HomeStats | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    
    const fetchHome = useCallback(async () => {
        try {
            setError(null);
            const res = await fetch("/api/home", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                cache: "no-store"
            });
            if (!res.ok) {
                throw new Error(`Error ao buscar home`);
            }
            const data: HomeStats = await res.json();
            setStatus(data);
            setLoading(false);
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        fetchHome();
        const interval = setInterval(() => {fetchHome(), 10000});
        return () => clearInterval(interval);
    }, [fetchHome]);

    return {
        error,
        status,
        loading
    };
}