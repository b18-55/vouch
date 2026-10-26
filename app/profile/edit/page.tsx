'use client'
// 'use client' is a Next.js directive. It tells Next.js that this component 
// must run in the browser (Client Component) rather than purely on the server.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui'

/**
 * EDIT PROFILE PAGE
 * 
 * Purpose:
 * Allows users to update their full name, location, and bio.
 * 
 * UI/UX Fixes:
 * 1. Added a "Cancel" button to allow users to back out of the edit flow
 *    without saving changes. This is crucial for reducing user frustration.
 * 2. Used a responsive flex layout (flex-col-reverse on mobile, flex-row on desktop)
 *    so the primary "Save" action remains prominent and accessible.
 */
export default function EditProfilePage() {
  const router = useRouter()
  
  // --- STATE MANAGEMENT ---
  const [fullName, setFullName] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // --- FETCH CURRENT PROFILE DATA ---
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

  // --- SAVE CHANGES ---
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

    // Success! Route back to the main profile page
    router.push('/profile')
  }

  // --- LOADING SKELETON ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950 pb-20 animate-pulse transition-colors duration-200">
        <main className="mx-auto max-w-2xl px-5 py-8 lg:px-8">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8">
            <div className="h-8 w-40 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-2 h-4 w-72 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-8 space-y-6">
              <div>
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                <div className="h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
              </div>
              <div>
                <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                <div className="h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
              </div>
              <div>
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                <div className="h-32 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="flex gap-4">
                <div className="h-12 flex-1 rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="h-12 flex-[2] rounded-xl bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // --- RENDER UI ---
  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-20">
      
      <main className="mx-auto max-w-2xl px-5 py-8 lg:px-8">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8 transition-colors duration-200">
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">Edit Profile</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Update your personal details so employers can learn more about you.
          </p>

          <form onSubmit={handleSave} className="mt-8 space-y-6">
            
            {/* --- FULL NAME INPUT --- */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Full Name</span>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
                className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition" 
              />
            </label>

            {/* --- LOCATION INPUT --- */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Location</span>
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g. Windhoek, Namibia" 
                className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition" 
              />
            </label>

            {/* --- BIO TEXTAREA --- */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Short Bio</span>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition" 
                placeholder="Tell employers a bit about yourself, your goals, and what kind of work you are looking for."
              />
            </label>

            {/* --- ERROR MESSAGE --- */}
            {error && <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>}

            {/* --- ACTION BUTTONS (Save & Cancel) --- */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              {/* Cancel Button: Routes back to the profile without saving */}
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="w-full sm:w-1/3 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              
              {/* Save Button: Submits the form */}
              <Button type="submit" className="w-full sm:w-2/3" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}