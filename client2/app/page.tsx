'use client';
import Image from "next/image";
import {useSession} from "next-auth/react";
import Profile from "@/app/profile/page";
import LoginForm from "@/app/login/page";


export default function Home() {
  const { data: session } = useSession();
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      ola
      {!session?.user && <LoginForm />}
      {session?.user && <Profile />}
    </div>
  );
}
