"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      setCurrentUser(userData.user);

      // ambil profile sendiri
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      setProfile(profileData);

      // ambil user lain
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", userData.user.id);

      setUsers(data || []);
    };

    fetchData();
  }, []);

  if (!currentUser)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
          <p className="text-emerald-200 animate-pulse">Loading Kalbe Chat...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 p-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Branding Section */}
        <div className="flex flex-col items-center justify-center py-10 space-y-6">
          <div className="p-5 bg-white/5 rounded-full ring-1 ring-white/10 shadow-2xl backdrop-blur-sm">
            <img src="/kalbe_icon-removebg-preview.png" alt="Kalbe Logo" className="w-24 h-24 object-contain drop-shadow-lg" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-xl">
              Welcome to <span className="text-emerald-400">Kalbe Chat</span>
            </h1>
            <p className="text-emerald-200/60 text-xs md:text-sm font-bold tracking-[0.2em] uppercase">
              (communication app for kalbe team)
            </p>
          </div>
        </div>

        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="h-8 w-1.5 bg-gradient-to-b from-emerald-400 to-green-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">
            Hello, <span className="text-emerald-300">{profile?.username}</span>
          </h2>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10">
          <h2 className="text-xl font-semibold text-emerald-100 mb-6">
            Start a Conversation
          </h2>

          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 p-4 rounded-2xl flex justify-between items-center transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={user.profile_pic || "/defaultpp.png"}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/50 group-hover:ring-emerald-400 transition-all"
                  />
                  <span className="text-white font-medium text-lg">
                    {user.username}
                  </span>
                </div>
                <button
                  onClick={() => router.push(`/chat/${user.id}`)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-xl font-medium shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  Chat
                </button>
              </div>
            ))}

            {users.length === 0 && (
              <p className="text-center text-emerald-200/50 py-8">
                No other users found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
