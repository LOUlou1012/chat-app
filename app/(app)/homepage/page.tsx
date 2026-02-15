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
      <div className="min-h-screen flex items-center justify-center bg-emerald-900 text-white">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 tracking-wide">
          Welcome, <span className="text-emerald-300">{profile?.username}</span>
        </h1>

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
