'use client'
// 'use client' is a Next.js directive. It tells Next.js that this component 
// runs on the browser (Client Component). We need this because we use React 
// hooks (useState, useEffect) and handle form submissions.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button, Icon } from '@/components/ui'

export default function EditProfilePage() {
  const router = useRouter()
  
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  const [fullName, setFullName] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // ==========================================
  // 2. FETCH CURRENT DATA ON LOAD
  // ==========================================
  useEffect(() => {
    const loadProfile = async () => {
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('full_name, location, bio')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setFullName(data.full_name || '')
        setLocation(data.location || '')
        setBio(data.bio || '')
      }
      
      setLoading(false)
    }
    
    loadProfile()
  }, [router])

  // ==========================================
  // 3. SAVE CHANGES TO SUPABASE
  // ==========================================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        location: location,
        bio: bio,
      })
      .eq('id', session.user.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push('/profile')
  }

  // ==========================================
  // 4. SKELETON LOADER (Matches the form layout)
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] pb-20 animate-pulse">
        {/* Top Nav Skeleton */}
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white px-5 lg:px-8">
          <div className="h-4 w-32 rounded bg-slate-200" />
        </header>

        <main className="mx-auto max-w-2xl px-5 py-8 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            
            {/* Title Skeleton */}
            <div className="h-8 w-40 rounded bg-slate-200" />
            <div className="mt-2 h-4 w-72 rounded bg-slate-200" />

            <div className="mt-8 space-y-6">
              {/* Full Name Field Skeleton */}
              <div>
                <div className="h-4 w-24 rounded bg-slate-200 mb-2" />
                <div className="h-12 w-full rounded-xl bg-slate-200" />
              </div>

              {/* Location Field Skeleton */}
              <div>
                <div className="h-4 w-20 rounded bg-slate-200 mb-2" />
                <div className="h-12 w-full rounded-xl bg-slate-200" />
              </div>

              {/* Bio Field Skeleton */}
              <div>
                <div className="h-4 w-24 rounded bg-slate-200 mb-2" />
                <div className="h-32 w-full rounded-xl bg-slate-200" />
              </div>

              {/* Save Button Skeleton */}
              <div className="h-12 w-full rounded-xl bg-slate-200" />
            </div>

          </div>
        </main>
      </div>
    )
  }

  // ==========================================
  // 5. RENDER THE FORM UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-20">
      
      {/* --- TOP NAVIGATION --- */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
        <Link href="/profile" className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-black">
          <Icon name="back" size={18} />
          Back to Profile
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-8 lg:px-8">
        
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold text-slate-950">Edit Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Update your personal details so employers can learn more about you.</p>

          <form onSubmit={handleSave} className="mt-8 space-y-6">
            
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Full Name</span>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" 
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Location</span>
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g. Windhoek, Namibia" 
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" 
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Short Bio</span>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" 
                placeholder="Tell employers a bit about yourself, your goals, and what kind of work you are looking for."
              />
            </label>

            {error && <p className="text-sm font-bold text-red-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>

          </form>
        </div>
      </main>
    </div>
  )
}