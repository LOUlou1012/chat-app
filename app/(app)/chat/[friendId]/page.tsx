'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 flex flex-col h-[80vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
          <img 
            src={friendProfile?.profile_pic || '/defaultpp.png'} 
            className="w-10 h-10 rounded-full object-cover"
            alt="Friend"
          />
          <h2 className="text-white font-bold text-lg">{friendProfile?.username || 'Loading...'}</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id
            const senderProfile = isMe ? myProfile : friendProfile
            
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <img 
                  src={senderProfile?.profile_pic || '/defaultpp.png'} 
                  className="w-10 h-10 rounded-full object-cover mt-1"
                  alt="Avatar"
                />
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-200 text-xs font-medium">
                      {senderProfile?.username}
                    </span>
                    <span className="text-emerald-400/60 text-[10px]">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-white text-sm shadow-md ${
                    isMe 
                    ? 'bg-emerald-600 rounded-tr-none' 
                    : 'bg-emerald-800 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex gap-3">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 bg-white/10 text-white placeholder-emerald-200/50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition active:scale-95"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
