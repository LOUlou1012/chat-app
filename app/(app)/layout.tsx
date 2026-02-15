"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div>
      
      <nav className="sticky top-0 z-50 flex justify-between items-center p-4 border-b bg-[#022c22] text-white">
        <div className="flex items-center gap-2">
          <Image src="/kalbe_icon-removebg-preview.png" alt="KalbeLogo" width={32} height={32} />
          <h1 className="font-bold text-lg">Kalbe Chat</h1>
        </div>

        <div className="flex gap-4 items-center">
          <Link href="/homepage">Home</Link>
          <Link href="/profile">Profile</Link>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </nav>


      {/* PAGE CONTENT */}
      <div>{children}</div>
    </div>
  );
}
