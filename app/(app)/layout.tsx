"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      setRole(profile?.role || null);
    };

    fetchRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div>
      <nav className="sticky top-0 z-50 flex justify-between items-center p-4 border-b bg-[#022c22] text-white">
        <Link href="/homepage">
          <div className="flex items-center gap-2">
            <Image
              src="/kalbe_icon-removebg-preview.png"
              alt="KalbeLogo"
              width={32}
              height={32}
            />
            <h1 className="font-bold text-lg">Kalbe Chat</h1>
          </div>
        </Link>

        <div className="flex gap-4 items-center">
          <Link href="/homepage">Chat</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/requests">Requests</Link>
          <Link href="/forum">Forum</Link>

          {role === "admin" && (
            <Link href="/userManagement">User Management</Link>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      <div>{children}</div>
    </div>
  );
}