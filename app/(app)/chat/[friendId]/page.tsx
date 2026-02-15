'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ChatPage() {
  const { friendId } = useParams()
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    getUser()
  }, [])

  async function getUser() {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      setUser(data.user)
      getMessages(data.user.id)
    }
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
    <div className="p-6">
      <div className="space-y-2 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="p-2 bg-gray-200 rounded">
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="border px-3 py-2 flex-1"
          placeholder="Type message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  )
}
