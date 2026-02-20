"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Register success! Check your email if confirmation is enabled.");
    }
  };

  const handleLogin = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);
  } else {
    router.push("/forum");
  }
};




  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 space-y-8">
        
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-5 bg-white/5 rounded-full ring-1 ring-white/10 shadow-2xl backdrop-blur-sm">
            <img 
              src="/kalbe_icon-removebg-preview.png" 
              alt="Kalbe Logo" 
              className="w-20 h-20 object-contain drop-shadow-lg" 
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-xl">
              Welcome to <span className="text-emerald-400">Kalbe Chat</span>
            </h1>
            <p className="text-emerald-200/60 text-xs font-bold tracking-[0.2em] uppercase">
              communication app for kalbe's developer team
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-3">
            <input
              className="w-full bg-white/10 text-white placeholder-emerald-200/50 border border-white/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition backdrop-blur-sm"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full bg-white/10 text-white placeholder-emerald-200/50 border border-white/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition backdrop-blur-sm"
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleLogin}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              Login
            </button>
            <button
              onClick={handleRegister}
              className="w-full bg-white/5 hover:bg-white/10 text-emerald-100 py-3 rounded-xl font-semibold border border-white/10 transition-all active:scale-95"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
