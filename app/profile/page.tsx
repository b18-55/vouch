'use client'
// 'use client' is a Next.js directive. It tells Next.js that this component 
// must run in the browser (Client Component) rather than purely on the server.
// We need this because we use React hooks (useState, useEffect) and read the URL.

// --- IMPORTS ---
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button, Icon } from '@/components/ui'

// ==========================================
// 1. TYPESCRIPT TYPES
// ==========================================
type Profile = {
  full_name: string | null
  location: string | null
  bio: string | null
  trust_score: number | null
}

// FIX 1: Added 'id' to the Skill type so we have a unique identifier from the database
type Skill = { 
  id: string
  name: string 
}

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
  const router = useRouter()
  
  // --- STATE MANAGEMENT ---
  const [profile, setProfile] = useState<Profile | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  // --- FETCH DATA ON PAGE LOAD ---
  useEffect(() => {
    const loadProfile = async () => {
      
      // Step A: Check if the user is actually logged in.
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Step B: Fetch Profile, Skills, and Experiences AT THE SAME TIME.
      const [profileRes, skillsRes, expRes] = await Promise.all([
        
        // 1. Get the user's basic info from the 'profiles' table.
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        
        // FIX 2: Fetch the 'id' along with the 'name' so React has a unique key to use
        supabase.from('skills').select('id, name').eq('profile_id', session.user.id),
        
        // 3. Get all experiences linked to this user, sorted newest first.
        supabase.from('experiences').select('*').eq('profile_id', session.user.id).order('created_at', { ascending: false })
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (skillsRes.data) setSkills(skillsRes.data)
      if (expRes.data) setExperiences(expRes.data)

      setLoading(false)
    }
    
    loadProfile()
  }, [router])

  // --- LOADING STATE ---
  if (loading) {
    return <p className="p-8 text-center text-slate-500">Loading your profile...</p>
  }

  // --- HELPER LOGIC ---
  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'U'

  // FIX 3: Create a deduplicated list of skills before rendering.
  // We use a Map to keep only one instance of each skill name.
  const uniqueSkills = Array.from(
    new Map(skills.map(skill => [skill.name, skill])).values()
  )

  // ==========================================
  // 3. RENDER THE UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-20">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-black">
          ← Back to Dashboard
        </Link>
      </header>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        
        {/* PROFILE HEADER CARD */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="h-28 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500" />
          
          <div className="px-5 pb-7 sm:px-8">
            <div className="-mt-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              
              <div className="flex items-end gap-4">
                <div className="grid h-24 w-24 place-items-center rounded-3xl border-4 border-white bg-blue-100 text-2xl font-extrabold text-blue-700 shadow-sm">
                  {initials}
                </div>
                
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
              
              <Button kind="secondary" onClick={() => {}}>
                <Icon name="edit" size={17} />
                Edit profile
              </Button>
            </div>
            
            <p className="mt-6 max-w-2xl text-sm leading-6 text-slate-600">
              {profile?.bio || 'No bio added yet. Tell employers a bit about yourself.'}
            </p>
          </div>
        </div>

        {/* MAIN GRID */}
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
              
              <div className="mt-5 flex flex-wrap gap-2">
                {uniqueSkills.length === 0 ? (
                  <p className="text-sm text-slate-500">No skills added yet. Log an experience to get AI suggestions!</p>
                ) : (
                  // FIX 4: Map through 'uniqueSkills' and use 'skill.id' as the key
                  uniqueSkills.map((skill) => (
                    <span 
                      key={skill.id} 
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
                  experiences.map((exp) => (
                    <div 
                      key={exp.id}
                      className="relative pl-7 before:absolute before:left-[5px] before:top-6 before:h-[calc(100%+1.5rem)] before:w-px before:bg-slate-200 last:before:hidden" 
                    >
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
            
            {/* PROFILE STRENGTH CARD */}
            <div className="rounded-2xl bg-slate-950 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">Profile strength</p>
                  <p className="mt-1 text-xs text-slate-400">Self-reported</p>
                </div>
                <p className="text-3xl font-extrabold">70%</p>
              </div>
              
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