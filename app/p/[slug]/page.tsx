'use client'
// 'use client' is required because this component runs in the browser. 
// We need this because we read the URL parameter (slug) and use React state (useState, useEffect).

import { useEffect, useState } from 'react'
// useEffect: Runs the data fetching when the page loads.
// useState: Stores the data so the UI updates when the data arrives.

import { useParams } from 'next/navigation'
// useParams: A Next.js hook that lets us read the dynamic part of the URL.
// Because our folder is named [slug], it will grab whatever is in that space.

import { supabase } from '@/lib/supabase'
import { Icon } from '@/components/ui'

// ==========================================
// 1. TYPESCRIPT TYPES
// ==========================================
// These define the exact shape of the data we expect from Supabase.
type PublicProfile = {
  id: string
  full_name: string
  location: string
  bio: string
  trust_score: number
}

type Skill = { name: string }

type Experience = { title: string, description: string }

export default function PublicProfilePage() {
  
  // ==========================================
  // 2. DYNAMIC ROUTING
  // ==========================================
  // This extracts the unique ID from the URL. 
  // If the URL is `vouch.app/p/abc-123`, then `slug` will be "abc-123".
  const params = useParams()
  const slug = params.slug as string

  // --- STATE ---
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ==========================================
  // 3. FETCH PUBLIC DATA (No Auth Required!)
  // ==========================================
  useEffect(() => {
    const loadPublicData = async () => {
      if (!slug) return

      try {
        // --- Step A: Fetch the main profile ---
        // NOTICE: There is no `supabase.auth.getSession()` check here!
        // This is because we created a public RLS policy in Supabase that 
        // allows anyone to read a profile if they have the public_slug.
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, location, bio, trust_score')
          .eq('public_slug', slug) // Find the user with this specific slug
          .single() // We only expect one result

        // If the slug is wrong, or the database fails, show an error.
        if (profileError || !profileData) {
          setError('Profile not found. The link might be broken.')
          setLoading(false)
          return
        }

        setProfile(profileData)

        // --- Step B: Fetch Skills and Experiences ---
        // We use `Promise.all` to run both database queries at the exact same time.
        // This makes the page load much faster than waiting for one, then the other.
        const [skillsRes, expRes] = await Promise.all([
          supabase.from('skills').select('name').eq('profile_id', profileData.id),
          supabase.from('experiences').select('title, description').eq('profile_id', profileData.id)
        ])

        // Save the results to state so they render on the screen.
        if (skillsRes.data) setSkills(skillsRes.data)
        if (expRes.data) setExperiences(expRes.data)

      } catch (err) {
        setError('An error occurred loading this profile.')
      } finally {
        // This ensures the loading spinner turns off, even if a query fails.
        setLoading(false)
      }
    }

    loadPublicData()
  }, [slug]) // Re-run this effect if the URL slug changes.

  // ==========================================
  // 4. SKELETON LOADING UI (NEW)
  // ==========================================
  // We replaced the simple text with a pulsing skeleton that matches the layout.
  // We also added dark mode classes (dark:bg-slate-950, dark:bg-slate-800) 
  // so it doesn't flash a bright white screen on dark mode phones.
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950 py-12 px-4 transition-colors duration-300">
        <div className="mx-auto max-w-2xl">
          
          {/* Badge Skeleton */}
          <div className="mb-6 flex justify-center">
            <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Main Card Skeleton */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="ml-auto h-10 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="py-6 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-8 w-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>

        </div>
      </div>
    )
  }

  // --- ERROR STATE ---
  if (error) return <p className="p-8 text-center text-red-500 dark:bg-slate-950 dark:text-red-400 min-h-screen">{error}</p>

  // ==========================================
  // 5. RENDER THE MAIN UI (DARK MODE APPLIED)
  // ==========================================
  // We added 'dark:bg-slate-950' to the background and 'dark:text-white' 
  // to the titles, so it looks perfect on any phone setting.
  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950 py-12 px-4 transition-colors duration-300">
      <div className="mx-auto max-w-2xl">
        
        {/* --- VERIFIED BADGE --- */}
        {/* This badge is crucial. It proves to the employer that this data is trustworthy. */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
            <Icon name="check" size={14} /> Verified by Vouch
          </span>
        </div>

        {/* --- MAIN PROFILE CARD --- */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm transition-colors duration-300">
          
          {/* Header: Avatar, Name, Location, Trust Score */}
          <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            
            {/* Avatar Circle (shows first 2 letters of name) */}
            <div className="grid h-16 w-16 place-items-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-xl font-extrabold text-blue-700 dark:text-blue-300">
              {/* If the name is null, default to 'U' for User */}
              {profile?.full_name?.slice(0, 2).toUpperCase() || 'U'}
            </div>
            
            {/* Name and Location */}
            <div>
              <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">{profile?.full_name}</h1>
              <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                <Icon name="location" size={15} /> {profile?.location || 'Location not set'}
              </p>
            </div>
            
            {/* Trust Score */}
            <div className="ml-auto text-right">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Trust Score</p>
              <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{profile?.trust_score ?? 0}/100</p>
            </div>
          </div>

          {/* Bio Section */}
          <div className="py-6">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">About</h2>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{profile?.bio || 'No bio added yet.'}</p>
          </div>

          {/* Skills Section */}
          <div className="pb-6">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Verified Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No skills added yet.</p>
              ) : (
                // Loop through the skills and display them as blue pills
                skills.map((skill) => (
                  <span key={skill.name} className="rounded-xl border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 text-sm font-bold text-blue-700 dark:text-blue-300">
                    {skill.name}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Experience Section */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Experience</h2>
            <div className="space-y-4">
              {experiences.map((exp, i) => (
                <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{exp.title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          This profile was created and verified on Vouch.
        </p>
      </div>
    </div>
  )
}