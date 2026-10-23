'use client'
// 'use client' is required because we use React hooks (useState, useEffect) 
// and Next.js routing to make the page interactive.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button, Icon, PageTitle } from '@/components/ui'

// TypeScript type to ensure we know exactly what shape our profile data has.
type Profile = {
  id: string
  full_name: string | null
  trust_score: number | null
}

export default function DashboardPage() {
  // --- STATE ---
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // --- FETCH DATA ON LOAD ---
  useEffect(() => {
    const load = async () => {
      // Check if the user is logged in
      const { data: { session } } = await supabase.auth.getSession()

      // If no session, kick them back to the login page
      if (!session) {
        router.push('/login')
        return
      }

      // Fetch the user's profile from Supabase
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, trust_score')
        .eq('id', session.user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }
    load()
  }, [router])

  // --- LOGOUT HANDLER ---
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // --- DYNAMIC TIME & DATE LOGIC ---
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'
  
  // Format today's date dynamically
  const todayDate = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })

  // ==========================================
  // SKELETON LOADER (Dark Mode Compatible)
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 pb-20 animate-pulse transition-colors duration-200">
        {/* Top Nav Skeleton */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-5 lg:px-8" />
        
        <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
          {/* Page Title Skeleton */}
          <div className="mb-8 space-y-3">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 w-64 bg-slate-300 dark:bg-slate-600 rounded" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>

          {/* Banner & Profile Strength Skeleton */}
          <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-3xl" />
            <div className="h-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl" />
          </div>

          {/* Task Matches Skeleton */}
          <div className="mt-9">
            <div className="h-6 w-48 bg-slate-300 dark:bg-slate-600 rounded mb-4" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="h-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl" />
              <div className="h-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-20">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-5 lg:px-8 transition-colors duration-200">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Your experience counts.</p>
        <div className="flex items-center gap-4">
          
          {/* Settings Button */}
          <button 
            onClick={() => router.push('/settings')}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </button>

          {/* Logout Button */}
          <button onClick={handleLogout} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
            Log out
          </button>
          
          {/* Avatar Button */}
          <button 
            onClick={() => router.push('/profile')}
            className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 dark:bg-blue-900/60 text-sm font-extrabold text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
          >
            {profile?.full_name?.slice(0, 2).toUpperCase() || 'U'}
          </button>
          
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        
        {/* PageTitle with dynamic date and greeting */}
        <PageTitle 
          eyebrow={todayDate} 
          title={`${greeting}, ${profile?.full_name?.split(' ')[0] || 'friend'}`} 
          text="Here’s your next best step." 
        />

        <section className="mt-7 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          
          {/* --- BLUE PROFILE TIP BANNER --- */}
          <div className="relative overflow-hidden rounded-3xl bg-blue-700 p-6 text-white sm:p-8 shadow-sm">
            <div className="relative z-10 max-w-lg">
              <span className="inline-flex rounded-full bg-blue-500/40 px-3 py-1 text-xs font-bold text-blue-50">PROFILE TIP</span>
              <h2 className="mt-5 text-2xl font-extrabold sm:text-3xl">Turn your daily grind into gold</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-blue-100">We’ll help turn what you did into skills employers understand. It takes less than 3 minutes.</p>
              <Button className="mt-6" icon="arrow" kind="secondary" href="/hustle">Log an experience</Button>
            </div>
            <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full border-[55px] border-blue-600" />
          </div>

          {/* --- PROFILE STRENGTH CARD --- */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 transition-colors duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Profile strength</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Self-reported</p>
              </div>
              <span className="text-3xl font-extrabold text-slate-950 dark:text-white">70%</span>
            </div>
            <div className="mt-5 h-2 rounded-full bg-slate-100 dark:bg-slate-700">
              <div className="h-full w-[70%] rounded-full bg-blue-600 dark:bg-blue-500" />
            </div>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"><Icon name="check" size={13} /></span>
                Basic details added
              </li>
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"><Icon name="check" size={13} /></span>
                Trust score: {profile?.trust_score ?? 0}/100
              </li>
              <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                <span className="h-5 w-5 rounded-full border border-slate-200 dark:border-slate-700" />
                Add one more experience
              </li>
            </ul>
          </div>
        </section>

        {/* --- GOOD MATCHES SECTION --- */}
        <section className="mt-9">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Good matches for you</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Based on your self-reported skills</p>
            </div>
            <button className="hidden text-sm font-bold text-blue-600 dark:text-blue-400 sm:block" onClick={() => router.push('/tasks')}>
              View all opportunities
            </button>
          </div>
          
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            
            {/* Task Card 1 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 text-left shadow-sm transition-colors duration-200">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400"><Icon name="briefcase" /></span>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">92% match</span>
              </div>
              <h3 className="mt-5 text-base font-extrabold text-slate-950 dark:text-white">Weekend shop assistant</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Langa Corner Store</p>
              <div className="my-4 h-px bg-slate-100 dark:bg-slate-700" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-extrabold text-slate-900 dark:text-slate-100">R850</span>
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Icon name="clock" size={16} />2 days</span>
              </div>
            </div>
            
            {/* Task Card 2 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 text-left shadow-sm transition-colors duration-200">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400"><Icon name="briefcase" /></span>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">88% match</span>
              </div>
              <h3 className="mt-5 text-base font-extrabold text-slate-950 dark:text-white">Grade 8 maths tutor</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">BrightSteps Learning</p>
              <div className="my-4 h-px bg-slate-100 dark:bg-slate-700" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-extrabold text-slate-900 dark:text-slate-100">R1,200</span>
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Icon name="clock" size={16} />4 days</span>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  )
}