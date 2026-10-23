'use client'
// 'use client' is a Next.js directive. It tells Next.js that this component 
// runs in the browser (Client Component). We need this because we use React 
// hooks (useState, useEffect) and handle interactive form submissions.

// --- IMPORTS ---
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
  // Form input field states initialized as empty strings
  const [fullName, setFullName] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  
  // Asynchronous status states for UI feedback
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // ==========================================
  // 2. FETCH CURRENT DATA ON LOAD
  // ==========================================
  useEffect(() => {
    const loadProfile = async () => {
      // Step A: Check if there is an active logged-in user session in Supabase Auth
      const { data: { session } } = await supabase.auth.getSession()
      
      // Redirect unauthenticated users to the login page immediately
      if (!session) {
        router.push('/login')
        return
      }

      // Step B: Fetch profile fields from the database corresponding to the authenticated user ID
      const { data } = await supabase
        .from('profiles')
        .select('full_name, location, bio')
        .eq('id', session.user.id)
        .single()

      // Step C: Populate form state values with retrieved data if available
      if (data) {
        setFullName(data.full_name || '')
        setLocation(data.location || '')
        setBio(data.bio || '')
      }
      
      // Stop the animated skeleton loading state
      setLoading(false)
    }
    
    loadProfile()
  }, [router])

  // ==========================================
  // 3. SAVE CHANGES TO SUPABASE
  // ==========================================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent full page reload on form submit
    setSaving(true)    // Show saving status on submit button
    setError('')       // Reset previous error messages

    // Get current session token for user identity confirmation
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Perform update operation on the user's profile row in PostgreSQL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        location: location,
        bio: bio,
      })
      .eq('id', session.user.id)

    // Handle any query or database constraint errors
    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    // On success, navigate the user back to their updated main profile page
    router.push('/profile')
  }

  // ==========================================
  // 4. SKELETON LOADER (Dark Mode Compatible)
  // ==========================================
  // Renders a smooth placeholder wireframe while fetching profile details
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 pb-20 animate-pulse transition-colors duration-200">
        
        {/* Top Header Navigation Skeleton */}
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-5 lg:px-8">
          <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        </header>

        {/* Main Form Container Skeleton */}
        <main className="mx-auto max-w-2xl px-5 py-8 lg:px-8">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm sm:p-8">
            
            {/* Header & Subtitle Skeleton */}
            <div className="h-8 w-40 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-2 h-4 w-72 rounded bg-slate-200 dark:bg-slate-700" />

            <div className="mt-8 space-y-6">
              {/* Full Name Input Skeleton */}
              <div>
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                <div className="h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Location Input Skeleton */}
              <div>
                <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                <div className="h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Bio Input Skeleton */}
              <div>
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                <div className="h-32 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Save Button Skeleton */}
              <div className="h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
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
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-20">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-5 lg:px-8 transition-colors duration-200">
        <Link href="/profile" className="flex items-center gap-1 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">
          <Icon name="back" size={18} />
          Back to Profile
        </Link>
      </header>

      {/* --- MAIN FORM CONTENT AREA --- */}
      <main className="mx-auto max-w-2xl px-5 py-8 lg:px-8">
        
        {/* Main Card Container */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm sm:p-8 transition-colors duration-200">
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">Edit Profile</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Update your personal details so employers can learn more about you.
          </p>

          <form onSubmit={handleSave} className="mt-8 space-y-6">
            
            {/* --- FULL NAME FIELD --- */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Full Name</span>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
                className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition" 
              />
            </label>

            {/* --- LOCATION FIELD --- */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Location</span>
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g. Windhoek, Namibia" 
                className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition" 
              />
            </label>

            {/* --- SHORT BIO FIELD --- */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Short Bio</span>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition" 
                placeholder="Tell employers a bit about yourself, your goals, and what kind of work you are looking for."
              />
            </label>

            {/* --- ERROR MESSAGE FEEDBACK --- */}
            {error && <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>}

            {/* --- SUBMIT ACTION BUTTON --- */}
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>

          </form>
        </div>
      </main>
    </div>
  )
}