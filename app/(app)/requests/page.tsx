"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      setCurrentUser(userData.user);

      const { data } = await supabase
        .from("friend_requests")
        .select(`
          id,
          sender_id,
          profiles:sender_id (
            username
          )
        `)
        .eq("receiver_id", userData.user.id)
        .eq("status", "pending");

      setRequests(data || []);
    };

    fetchRequests();
  }, []);

  const handleAccept = async (request: any) => {
    if (!currentUser) return;

    await supabase.from("friendships").insert({
      user1: request.sender_id,
      user2: currentUser.id,
    });

    await supabase
      .from("friend_requests")
      .delete()
      .eq("id", request.id);

    alert("Friend accepted!");
    location.reload();
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Incoming Requests</h1>

      {requests.map((req) => (
        <div
          key={req.id}
          className="border p-3 rounded mb-2 flex justify-between"
        >
          <span>{req.profiles?.username}</span>

          <button
            onClick={() => handleAccept(req)}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Accept
          </button>
        </div>
      ))}
    </div>
  );
}
