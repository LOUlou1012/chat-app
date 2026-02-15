"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

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

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">
        Welcome {profile?.username}
      </h1>

      <h2 className="text-xl mb-3">User List</h2>

      {users.map((user) => (
        <div
          key={user.id}
          className="border p-3 rounded mb-2"
        >
          {user.username}
        </div>
      ))}
    </div>
  );
}
