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
  // This calculates the greeting based on the user's local time
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'
  
  // This formats today's date dynamically (e.g., "Thursday, 22 October")
  const todayDate = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })

  // Show a loading state while we fetch the data
  if (loading) return <p className="p-8 text-center text-slate-500">Loading your dashboard...</p>

  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-20">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
        <p className="text-sm font-semibold text-slate-500">Your experience counts.</p>
        <div className="flex items-center gap-4">
          
          {/* Logout Button */}
          <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-black">
            Log out
          </button>
          
          {/* FIX 1: Avatar Button now routes to the Profile Page */}
          <button 
            onClick={() => router.push('/profile')}
            className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-700 hover:bg-blue-200 transition-colors cursor-pointer"
          >
            {profile?.full_name?.slice(0, 2).toUpperCase() || 'U'}
          </button>
          
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        
        {/* FIX 2 & 3: PageTitle now uses the dynamic date and dynamic greeting */}
        <PageTitle 
          eyebrow={todayDate} 
          title={`${greeting}, ${profile?.full_name?.split(' ')[0] || 'friend'}`} 
          text="Here’s your next best step." 
        />

        <section className="mt-7 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          
          {/* --- BLUE PROFILE TIP BANNER --- */}
          <div className="relative overflow-hidden rounded-3xl bg-blue-700 p-6 text-white sm:p-8">
            <div className="relative z-10 max-w-lg">
              <span className="inline-flex rounded-full bg-blue-500/40 px-3 py-1 text-xs font-bold text-blue-50">PROFILE TIP</span>
              <h2 className="mt-5 text-2xl font-extrabold sm:text-3xl">Add your shop experience</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-blue-100">We’ll help turn what you did into skills employers understand. It takes less than 3 minutes.</p>
              {/* Button routes to the Hustle Log page */}
              <Button className="mt-6" icon="arrow" kind="secondary" href="/hustle">Log an experience</Button>
            </div>
            {/* Decorative background circle */}
            <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full border-[55px] border-blue-600" />
          </div>

          {/* --- PROFILE STRENGTH CARD --- */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Profile strength</p>
                <p className="mt-1 text-xs text-slate-500">Self-reported</p>
              </div>
              {/* Note: This is still hardcoded to 70%. We will make it dynamic on Friday. */}
              <span className="text-3xl font-extrabold text-slate-950">70%</span>
            </div>
            <div className="mt-5 h-2 rounded-full bg-slate-100">
              <div className="h-full w-[70%] rounded-full bg-blue-600" />
            </div>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-center gap-2 text-slate-700">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Icon name="check" size={13} /></span>
                Basic details added
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Icon name="check" size={13} /></span>
                Trust score: {profile?.trust_score ?? 0}/100
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="h-5 w-5 rounded-full border border-slate-200" />
                Add one more experience
              </li>
            </ul>
          </div>
        </section>

        {/* --- GOOD MATCHES SECTION --- */}
        <section className="mt-9">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">Good matches for you</h2>
              <p className="mt-1 text-sm text-slate-500">Based on your self-reported skills</p>
            </div>
            <button className="hidden text-sm font-bold text-blue-600 sm:block" onClick={() => router.push('/tasks')}>
              View all opportunities
            </button>
          </div>
          
          {/* Note: These are hardcoded sample tasks for the dashboard. The real tasks are on the /tasks page. */}
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            
            {/* Task Card 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700"><Icon name="briefcase" /></span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">92% match</span>
              </div>
              <h3 className="mt-5 text-base font-extrabold text-slate-950">Weekend shop assistant</h3>
              <p className="mt-1 text-sm text-slate-500">Langa Corner Store</p>
              <div className="my-4 h-px bg-slate-100" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-extrabold text-slate-900">R850</span>
                <span className="flex items-center gap-1.5 text-slate-500"><Icon name="clock" size={16} />2 days</span>
              </div>
            </div>
            
            {/* Task Card 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon name="briefcase" /></span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">88% match</span>
              </div>
              <h3 className="mt-5 text-base font-extrabold text-slate-950">Grade 8 maths tutor</h3>
              <p className="mt-1 text-sm text-slate-500">BrightSteps Learning</p>
              <div className="my-4 h-px bg-slate-100" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-extrabold text-slate-900">R1,200</span>
                <span className="flex items-center gap-1.5 text-slate-500"><Icon name="clock" size={16} />4 days</span>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  )
}