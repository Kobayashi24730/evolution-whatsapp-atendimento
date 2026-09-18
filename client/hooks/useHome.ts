'use client';

import { useState, useEffect, useCallback } from "react";


export function useHome() {
    
    const fetchHome = useCallback(async () => {
        try {

        } catch (error) {
            
        } finally {
            
        }
    });

    useEffect(() => {
        fetchHome();
        const interval = setInterval(() => {fetchHome(), 10000});
        return () => clearInterval(interval);
    }, [fetchHome]);
    return (

    );
}