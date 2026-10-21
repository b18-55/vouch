'use client'
// 'use client' is a Next.js directive. It tells Next.js that this component 
// must run in the browser (Client Component) rather than purely on the server.
// We need this because we use React hooks (useState, useEffect) and read the URL.

// --- IMPORTS ---
import { useEffect, useState } from 'react'
// useEffect: Allows us to run code when the component first loads (like fetching data).
// useState: Allows us to store data in variables that update the screen when they change.

import { useRouter } from 'next/navigation'
// useRouter: Gives us the ability to redirect the user (e.g., kick them to /login).

import Link from 'next/link'
// Link: A special Next.js component for fast client-side navigation. 
// It's better than a standard <a> tag because it doesn't reload the whole page.

import { supabase } from '@/lib/supabase'
// This is our database connection. It's securely configured in lib/supabase.ts.

import { Button, Icon } from '@/components/ui'
// We import reusable UI components from your teammate's ui.tsx file.

// ==========================================
// 1. TYPESCRIPT TYPES
// ==========================================
// We tell TypeScript exactly what shape our data has. This prevents bugs.
// For example, if we try to render `profile.age`, TypeScript will error because 
// it knows our Profile type doesn't have an 'age' property.

type Profile = {
  full_name: string | null
  location: string | null
  bio: string | null
  trust_score: number | null
}

type Skill = { name: string }

type Experience = { 
  id: string
  title: string
  type: string
  created_at: string 
}

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function ProfilePage() {
  // Initializes the router so we can change pages programmatically.
  const router = useRouter()
  
  // --- STATE MANAGEMENT ---
  // These variables hold the data we fetch from the database.
  // They start as empty (null or []) and get filled in once the data loads.
  const [profile, setProfile] = useState<Profile | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  
  // This boolean tracks if we are still waiting for the database. 
  // If true, we show a "Loading..." message. If false, we show the page.
  const [loading, setLoading] = useState(true)

  // --- FETCH DATA ON PAGE LOAD ---
  // The useEffect hook runs automatically once when the page opens.
  useEffect(() => {
    const loadProfile = async () => {
      
      // Step A: Check if the user is actually logged in.
      const { data: { session } } = await supabase.auth.getSession()
      
      // If there is no session, kick them to the login page and stop the function.
      if (!session) {
        router.push('/login')
        return
      }

      // Step B: Fetch Profile, Skills, and Experiences AT THE SAME TIME.
      // We use Promise.all to fire off all 3 database requests simultaneously.
      // This is much faster than waiting for one to finish before starting the next.
      const [profileRes, skillsRes, expRes] = await Promise.all([
        
        // 1. Get the user's basic info from the 'profiles' table.
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        
        // 2. Get all skills linked to this user's ID.
        supabase.from('skills').select('name').eq('profile_id', session.user.id),
        
        // 3. Get all experiences linked to this user, sorted newest first.
        supabase.from('experiences').select('*').eq('profile_id', session.user.id).order('created_at', { ascending: false })
      ])

      // Step C: Save the data to our state variables.
      // The 'if' checks ensure we don't crash if the database returns an error.
      if (profileRes.data) setProfile(profileRes.data)
      if (skillsRes.data) setSkills(skillsRes.data)
      if (expRes.data) setExperiences(expRes.data)

      // Step D: We are done loading, hide the spinner.
      setLoading(false)
    }
    
    loadProfile()
  }, [router]) // Dependencies: re-runs if the router changes.

  // --- LOADING STATE ---
  // If we are still waiting for the database, show this instead of the page.
  if (loading) {
    return <p className="p-8 text-center text-slate-500">Loading your profile...</p>
  }

  // --- HELPER LOGIC ---
  // Generate initials for the avatar (e.g., "Thabo Mokoena" -> "TM").
  // If no name exists, default to "U" for User.
  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'U'

  // ==========================================
  // 3. RENDER THE UI
  // ==========================================
  return (
    // 'min-h-screen' makes the page at least as tall as the browser window.
    // 'bg-[#f7f9fc]' is the light grey/blue background.
    <div className="min-h-screen bg-[#f7f9fc] pb-20">
      
      {/* --- TOP NAVIGATION BAR --- */}
      {/* 'sticky top-0' makes it stay pinned to the top when you scroll. */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-black">
          ← Back to Dashboard
        </Link>
      </header>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        
        {/* ==========================================
            PROFILE HEADER CARD
            ========================================== */}
        {/* 'overflow-hidden' ensures the blue banner doesn't spill out of the rounded corners. */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          
          {/* The decorative blue gradient banner at the top */}
          <div className="h-28 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500" />
          
          <div className="px-5 pb-7 sm:px-8">
            {/* '-mt-12' pulls the avatar upwards so it overlaps the blue banner. */}
            <div className="-mt-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              
              <div className="flex items-end gap-4">
                
                {/* Avatar Circle */}
                {/* 'border-4 border-white' gives it a nice white ring around the edges. */}
                <div className="grid h-24 w-24 place-items-center rounded-3xl border-4 border-white bg-blue-100 text-2xl font-extrabold text-blue-700 shadow-sm">
                  {initials}
                </div>
                
                {/* Name and Location */}
                <div className="pb-1">
                  <h1 className="text-2xl font-extrabold text-slate-950">
                    {profile?.full_name || 'Your Name'}
                  </h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <Icon name="location" size={15} />
                    {profile?.location || 'Location not set'}
                  </p>
                </div>
              </div>
              
              {/* Edit Button (Currently does nothing, just for show) */}
              <Button kind="secondary" onClick={() => {}}>
                <Icon name="edit" size={17} />
                Edit profile
              </Button>
            </div>
            
            {/* Bio Text */}
            <p className="mt-6 max-w-2xl text-sm leading-6 text-slate-600">
              {profile?.bio || 'No bio added yet. Tell employers a bit about yourself.'}
            </p>
          </div>
        </div>

        {/* ==========================================
            MAIN GRID (Left side: Skills & Experience | Right side: Strength)
            ========================================== */}
        {/* On desktop (lg), it splits into two columns. On mobile, it stacks vertically. */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          
          {/* --- LEFT COLUMN --- */}
          <div className="space-y-5">
            
            {/* SKILLS SECTION */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-950">Skills</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                  Self-reported
                </span>
              </div>
              
              {/* 'flex flex-wrap' makes the skill pills wrap to the next line if they run out of space. */}
              <div className="mt-5 flex flex-wrap gap-2">
                {skills.length === 0 ? (
                  // Empty State: Show this if they have no skills yet.
                  <p className="text-sm text-slate-500">No skills added yet. Log an experience to get AI suggestions!</p>
                ) : (
                  // Map through the skills array and create a blue pill for each one.
                  skills.map((skill) => (
                    <span 
                      key={skill.name}
                      className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700" 
                    >
                      {skill.name}
                    </span>
                  ))
                )}
              </div>
            </section>

            {/* EXPERIENCE TIMELINE SECTION */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-extrabold text-slate-950">Experience</h2>
              
              <div className="mt-5 space-y-6">
                {experiences.length === 0 ? (
                  <p className="text-sm text-slate-500">No experience logged yet.</p>
                ) : (
                  // Map through the experiences and create a timeline item for each.
                  experiences.map((exp) => (
                    // The 'before:' classes create a vertical line connecting the dots.
                    // 'last:before:hidden' removes the line on the very last item.
                    <div 
                      key={exp.id}
                      className="relative pl-7 before:absolute before:left-[5px] before:top-6 before:h-[calc(100%+1.5rem)] before:w-px before:bg-slate-200 last:before:hidden" 
                    >
                      {/* The blue dot on the timeline */}
                      <span className="absolute left-0 top-1 h-3 w-3 rounded-full border-[3px] border-blue-100 bg-blue-600" />
                      
                      <p className="text-sm font-bold text-slate-900">{exp.title}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {exp.type} · {new Date(exp.created_at).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <aside className="space-y-5">
            
            {/* PROFILE STRENGTH CARD (The dark box) */}
            <div className="rounded-2xl bg-slate-950 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">Profile strength</p>
                  <p className="mt-1 text-xs text-slate-400">Self-reported</p>
                </div>
                <p className="text-3xl font-extrabold">70%</p>
              </div>
              
              {/* The progress bar */}
              <div className="mt-5 h-2 rounded-full bg-slate-700">
                <div className="h-full w-[70%] rounded-full bg-blue-500" />
              </div>
              
              <p className="mt-4 text-xs leading-5 text-slate-300">
                Add one more experience to reach 80%.
              </p>
            </div>
          </aside>

        </div>
      </main>
    </div>
  )
}