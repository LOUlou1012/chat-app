'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  List,
  ListItem,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function ChatPage() {
  const { friendId } = useParams()
  const [user, setUser] = useState<any>(null)
  const [myProfile, setMyProfile] = useState<any>(null)
  const [friendProfile, setFriendProfile] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getUser()
    getFriendProfile()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function getUser() {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      setUser(data.user)
      getMyProfile(data.user.id)
      getMessages(data.user.id)
    }
  }

  async function getMyProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setMyProfile(data)
  }

  async function getFriendProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', friendId)
      .single()
    setFriendProfile(data)
  }

  async function getMessages(myId: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${myId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${myId})`
      )
      .order('created_at', { ascending: true })

    setMessages(data || [])
  }

  async function sendMessage() {
    if (!newMessage || !user) return

    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: friendId,
      content: newMessage
    })

    setNewMessage('')
    getMessages(user.id)
  }

  return (
    <Box sx={{
      minHeight: 'calc(100vh - 100px)',
      background: 'linear-gradient(to bottom right, #064e3b, #065f46, #14532d)',
      p: { xs: 1, sm: 2, md: 3 },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Paper
        elevation={12}
        sx={{
          width: '100%',
          maxWidth: '896px',
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          height: '85vh',
          overflow: 'hidden',
        }}
      >
        <AppBar position="static" sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: 'none' }}>
          <Toolbar>
            <Avatar
              src={friendProfile?.profile_pic || '/defaultpp.png'}
              alt="Friend"
              sx={{ width: 40, height: 40, mr: 2 }}
            />
            <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
              {friendProfile?.username || 'Loading...'}
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          <List>
            {messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              const senderProfile = isMe ? myProfile : friendProfile;

              return (
                <ListItem key={msg.id} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', p: '4px 0' }}>
                  <Box sx={{ display: 'flex', gap: 1, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-start', maxWidth: '70%' }}>
                    <Avatar
                      src={senderProfile?.profile_pic || '/defaultpp.png'}
                      alt="Avatar"
                      sx={{ width: 40, height: 40 }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#a7f3d0', fontWeight: 500 }}>
                          {senderProfile?.username}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(110, 231, 183, 0.6)', fontSize: '10px' }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      <Paper
                        elevation={3}
                        sx={{
                          p: '8px 16px',
                          bgcolor: isMe ? 'rgb(5, 150, 105)' : 'rgb(6, 95, 70)',
                          color: 'white',
                          borderRadius: '20px',
                          borderTopRightRadius: isMe ? 4 : '20px',
                          borderTopLeftRadius: isMe ? '20px' : 4,
                        }}
                      >
                        <Typography variant="body2">{msg.content}</Typography>
                      </Paper>
                    </Box>
                  </Box>
                </ListItem>
              );
            })}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.1)', '& fieldset': { borderColor: 'transparent' }, '&:hover fieldset': { borderColor: 'rgba(110, 231, 183, 0.5)' }, '&.Mui-focused fieldset': { borderColor: 'rgb(110, 231, 183)' } },
              '& .MuiInputBase-input': { color: 'white', '&::placeholder': { color: 'rgba(167, 243, 208, 0.5)', opacity: 1 } },
            }}
          />
          <Button variant="contained" onClick={sendMessage} endIcon={<SendIcon />} sx={{ bgcolor: 'rgb(16, 185, 129)', '&:hover': { bgcolor: 'rgb(52, 211, 153)' }, borderRadius: '12px', px: 3, py: 1.5 }}>
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
