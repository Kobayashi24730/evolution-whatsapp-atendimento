'use client';
import { useSession, signOut } from "next-auth/react";

export default function profile() {
    const { data: session } = useSession();
    return (
        <div>
            <h1>Profile</h1>
            {session?.user?.email}
        </div>
    );
}