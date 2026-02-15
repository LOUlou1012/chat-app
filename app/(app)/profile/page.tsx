'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)
  const [username, setUsername] = useState("")

  useEffect(() => {
    getUser()
  }, [])

  async function getUser() {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      setUser(data.user)
      getProfile(data.user.id)
    }
  }

  async function getProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    setProfile(data)
    setUsername(data?.username || "")
  }

  async function updateUsername() {
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id)

    if (error) {
      alert("Gagal update username")
      return
    }

    alert("Username updated!")
    getProfile(user.id)
  }

  async function uploadImage() {
    if (!file || !user) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}.${fileExt}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (error) return

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    await supabase
      .from('profiles')
      .update({ profile_pic: data.publicUrl })
      .eq('id', user.id)

    alert('Upload sukses!')
    getProfile(user.id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 space-y-8">

        <h1 className="text-3xl font-bold text-white text-center tracking-wide">
          Profile Settings
        </h1>

        {profile && (
          <>
            {/* AVATAR */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <img
                  src={profile.profile_pic || '/defaultpp.png'}
                  className="w-32 h-32 rounded-full object-cover shadow-xl ring-4 ring-emerald-400/30 transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-xl opacity-70"></div>
              </div>
            </div>

            {/* USERNAME */}
            <div className="space-y-3">
              <label className="text-sm text-emerald-200 font-medium">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-emerald-200 border-none focus:ring-2 focus:ring-emerald-400 rounded-xl px-4 py-3 outline-none transition"
              />

              <button
                onClick={updateUsername}
                className="w-full bg-gradient-to-r from-emerald-400 to-green-500 hover:opacity-90 text-black font-semibold py-3 rounded-xl shadow-lg transition duration-200 active:scale-95 cursor-pointer">
                Save Username
              </button>
            </div>

            {/* UPLOAD */}
            <div className="space-y-3">
              <div className="bg-white/10 rounded-2xl p-6 text-center backdrop-blur-lg">

                <label className="cursor-pointer text-emerald-300 font-medium hover:text-white transition">
                  Choose Image
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>

                <p className="mt-2 text-sm text-emerald-200">
                  {file ? file.name : "PNG / JPG up to 5MB"}
                </p>
              </div>

              <button
                onClick={uploadImage}
                disabled={!file}
                className=" w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:opacity-90 disabled:opacity-40 text-black font-semibold py-3 rounded-xl shadow-lg transition duration-200 active:scale-95 cursor-pointer disabled:cursor-not-allowed">
                Upload Photo
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
