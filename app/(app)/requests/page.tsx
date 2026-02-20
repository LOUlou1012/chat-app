"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function RequestsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setCurrentUser(data.user);

      fetchRequests(data.user.id);
    };

    init();
  }, []);

  const fetchRequests = async (userId: string) => {
    const { data } = await supabase
      .from("friend_requests")
      .select("*, profiles!friend_requests_sender_id_fkey(*)")
      .eq("receiver_id", userId)
      .eq("status", "pending");

    setRequests(data || []);
  };

  const handleSearch = async () => {
    if (!search) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${search}%`)
      .neq("id", currentUser.id);

    setResults(data || []);
  };

  const sendRequest = async (receiverId: string) => {
    await supabase.from("friend_requests").insert({
      sender_id: currentUser.id,
      receiver_id: receiverId,
      status: "pending",
    });

    alert("Friend request sent 🚀");
  };

  const acceptRequest = async (req: any) => {
    await supabase.from("friendships").insert({
      user1: currentUser.id,
      user2: req.sender_id,
    });

    await supabase
      .from("friend_requests")
      .delete()
      .eq("id", req.id);

    setRequests(requests.filter((r) => r.id !== req.id));
  };

  const rejectRequest = async (id: number) => {
    await supabase
      .from("friend_requests")
      .delete()
      .eq("id", id);

    setRequests(requests.filter((r) => r.id !== id));
  };

  return (
    <div className="p-6 text-white bg-emerald-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Friends</h1>
      
      {/* SEARCH & RESULTS */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 mb-10">
        <h2 className="text-xl font-semibold text-emerald-100 mb-4">
          Find New Friends
        </h2>
        <div className="flex gap-3">
          <input
            className="flex-1 bg-white/10 text-white placeholder-emerald-200/50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition active:scale-95"
          >
            Search
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-6 space-y-3">
            {results.map((user) => (
              <div key={user.id} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-white font-medium">{user.username}</span>
                <button
                  onClick={() => sendRequest(user.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
                >
                  Send Request
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REQUESTS */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10">
        <h2 className="text-xl font-semibold text-emerald-100 mb-6">
          Incoming Requests
        </h2>

        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-white font-medium">{req.profiles.username}</span>
                <div className="space-x-3">
                  <button
                    onClick={() => acceptRequest(req)}
                    className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectRequest(req.id)}
                    className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-emerald-200/50 py-8">No incoming requests.</p>
        )}
      </div>
    </div>
  );
}
