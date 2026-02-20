"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ForumPage() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setUser(data.user);
      fetchPosts();
    };
    init();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select(`
        *,
        profiles (
          username,
          profile_pic
        )
      `)
      .order("created_at", { ascending: false });

    setPosts(data || []);
  };

  const createPost = async () => {
    if (!title || !content) return;

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      title,
      content,
    });

    if (error) {
      console.error(error);
      return;
    }

    setTitle("");
    setContent("");
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight">
          Community Forum
        </h1>

        {/* CREATE POST */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 mb-10">
          <h2 className="text-xl font-semibold text-emerald-100 mb-4">
            Create a New Post
          </h2>
          <div className="space-y-4">
            <input
              className="w-full bg-white/10 text-white placeholder-emerald-200/50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition"
              placeholder="Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full bg-white/10 text-white placeholder-emerald-200/50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
            <button
              onClick={createPost}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition active:scale-95"
            >
              Create Post
            </button>
          </div>
        </div>

        {/* LIST POSTS */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => router.push(`/forum/${post.id}`)}
              className="bg-white/5 p-6 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors border border-white/10"
            >
              <div className="flex items-center gap-3 mb-3">
                <img src={post.profiles?.profile_pic || '/defaultpp.png'} alt={post.profiles?.username} className="w-8 h-8 rounded-full object-cover" />
                <p className="text-sm text-emerald-300 font-semibold">
                  {post.profiles?.username}
                </p>
              </div>
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <p className="text-white/70 line-clamp-2">{post.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
