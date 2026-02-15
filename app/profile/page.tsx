'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)

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
  }

  async function uploadImage() {
    console.log("clicked")
    console.log("file:", file)
    console.log("user:", user)
    if (!file || !user) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}.${fileExt}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (error) {
      console.log(error)
      return
    }

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
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      {profile && (
        <div className="space-y-4">
          <img
            src={profile.profile_pic || '/default.png'}
            className="w-32 h-32 rounded-full object-cover"
          />

          <div className="border-2 border-dashed border-gray-600 p-6 rounded-xl text-center">
            <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">
              Upload Profile Picture
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            <p className="mt-2 text-sm text-gray-400">
              {file ? file.name : "PNG, JPG up to 5MB"}
            </p>
          </div>



          <button
            onClick={uploadImage}
            disabled={!file}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg"
          >
            Upload
          </button>

        </div>
      )}
    </div>
  )
}
