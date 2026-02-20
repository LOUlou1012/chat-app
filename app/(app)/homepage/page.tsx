"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  Typography,
  Paper,
  Box,
} from '@mui/material';

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

            // ambil semua friendship yg melibatkan current user
      const { data: friendships } = await supabase
        .from("friendships")
        .select("*")
        .or(`user1.eq.${userData.user.id},user2.eq.${userData.user.id}`);

      if (!friendships) return;

      const friendIds = friendships.map((f) =>
        f.user1 === userData.user.id ? f.user2 : f.user1
      );

      // ambil profile teman
      if (friendIds.length > 0) {
        const { data: friends } = await supabase
          .from("profiles")
          .select("*")
          .in("id", friendIds);

        setUsers(friends || []);
      } else {
        setUsers([]);
      }

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

        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5, px: 1 }}>
          <Box sx={{ height: 32, width: 6, background: 'linear-gradient(to bottom, #34d399, #15803d)', borderRadius: '9999px' }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
            Hello, <Typography component="span" variant="h4" sx={{ color: '#6ee7b7', fontWeight: 'bold' }}>{profile?.username}</Typography>
          </Typography>
        </Box>

        <Paper
          elevation={6}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography variant="h5" sx={{ color: '#d1fae5', mb: 3, fontWeight: 600 }}>
            Start a Conversation
          </Typography>

          <List sx={{ p: 0 }}>
            {users.map((user) => (
              <ListItem
                key={user.id}
                secondaryAction={
                  <Button
                    variant="contained"
                    onClick={() => router.push(`/chat/${user.id}`)}
                    sx={{ bgcolor: 'rgb(16, 185, 129)', '&:hover': { bgcolor: 'rgb(52, 211, 153)' }, borderRadius: '12px', boxShadow: 'lg', px: 2.5, py: 1 }}
                  >
                    Chat
                  </Button>
                }
                sx={{
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  '&:hover .MuiAvatar-root': { borderColor: 'rgb(52, 211, 153)' },
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  p: 2,
                }}
              >
                <ListItemAvatar>
                  <Avatar src={user.profile_pic || "/defaultpp.png"} alt={user.username} sx={{ width: 48, height: 48, border: '2px solid rgba(16, 185, 129, 0.5)', transition: 'all 0.3s ease' }} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography sx={{ color: 'white', fontWeight: 500, fontSize: '1.125rem' }}>
                      {user.username}
                    </Typography>
                  }
                />
              </ListItem>
            ))}

            {users.length === 0 && (
              <Typography align="center" sx={{ color: 'rgba(167, 243, 208, 0.5)', py: 4 }}>
                No other users found.
              </Typography>
            )}
          </List>
        </Paper>
      </div>
    </div>
  );
}
