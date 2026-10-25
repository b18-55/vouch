'use client'
// 'use client' is a Next.js directive. It tells Next.js that this component 
// must run in the browser (Client Component) rather than purely on the server.
// We need this because we use React hooks (useState, useEffect) and browser APIs.

// --- IMPORTS ---
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button, Icon } from '@/components/ui'

// ==========================================
// 1. TYPESCRIPT TYPES
// ==========================================
// Defining the exact shape of our data ensures TypeScript catches errors
// if we try to access a property that doesn't exist.

type Profile = {
  full_name: string | null
  location: string | null
  bio: string | null
  trust_score: number | null
  // The unique ID used to generate the public shareable URL (/p/[slug]).
  public_slug: string | null 
}

type Skill = { 
  // The database 'id' is required so React can use it as a unique 'key' 
  // when mapping through the array to render the pills.
  id: string 
  name: string 
}

type Experience = { 
  id: string
  title: string
  type: string
  description?: string 
  created_at: string 
}

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function ProfilePage() {
  const router = useRouter()
  
  // --- CORE STATE ---
  // These hold the fetched data from the database.
  const [profile, setProfile] = useState<Profile | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  
  // Tracks if the initial database fetch is still loading.
  const [loading, setLoading] = useState(true)

  // --- UI INTERACTION STATE ---
  // Tracks WHICH experience is currently being deleted. This allows us to 
  // show a loading spinner on that specific trash can icon.
  const [deletingId, setDeletingId] = useState<string | null>(null) 
  
  // Tracks the experience currently open in the edit modal.
  // If this is null, the modal is closed. If it has data, the modal is open.
  const [editingExp, setEditingExp] = useState<Experience | null>(null) 
  
  // Controlled inputs for the Edit Modal form.
  const [editTitle, setEditTitle] = useState('') 
  const [editType, setEditType] = useState('') 
  const [editDescription, setEditDescription] = useState('') 
  
  // Prevents double-submitting the edit form.
  const [savingEdit, setSavingEdit] = useState(false) 

  // ==========================================
  // 3. FETCH DATA ON LOAD
  // ==========================================
  useEffect(() => {
    const loadProfile = async () => {
      // 1. Authenticate the user. If no session, redirect to login.
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      // 2. Fetch Profile, Skills, and Experiences SIMULTANEOUSLY.
      // 'Promise.all' fires all 3 database queries at the exact same time 
      // instead of waiting for one to finish before starting the next.
      const [profileRes, skillsRes, expRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('skills').select('id, name').eq('profile_id', session.user.id),
        supabase.from('experiences').select('*').eq('profile_id', session.user.id).order('created_at', { ascending: false })
      ])

      // 3. Save the data to React state to trigger a re-render.
      if (profileRes.data) setProfile(profileRes.data)
      if (skillsRes.data) setSkills(skillsRes.data)
      if (expRes.data) setExperiences(expRes.data)

      // 4. Stop the skeleton loader.
      setLoading(false)
    }
    
    loadProfile()
  }, [router]) 

  // ==========================================
  // 4. SHARE PROFILE LOGIC
  // ==========================================
  const shareProfile = async () => {
    const slug = profile?.public_slug
    if (!slug) return alert("Profile link not ready yet. Try reloading.")

    const url = `${window.location.origin}/p/${slug}`
    const text = 'Check out my verified skills on Vouch!'
    
    const shareData = {
      title: 'My Vouch Profile',
      text: text,
      url: url
    }

    // Use the native OS share sheet on mobile devices (iOS/Android).
    // This allows the user to send the link via WhatsApp, SMS, Email, etc.
    if (navigator.share) {
      try { 
        await navigator.share(shareData) 
      } catch (err) { 
        console.log('Share cancelled by user') 
      }
    } else {
      // Fallback for laptops/desktops: open WhatsApp Web directly.
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
    }
  }

  // ==========================================
  // 5. EDIT & DELETE LOGIC
  // ==========================================
  
  const handleDeleteExperience = async (id: string) => {
    // 1. Safety check: Ask for confirmation.
    if (!window.confirm('Are you sure you want to delete this experience?')) return

    // 2. Set the loading state for this specific card.
    setDeletingId(id) 

    try {
      // 3. Delete the experience itself.
      const { error: expError } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)

      if (expError) throw expError

      // 4. BELT-AND-SUSPENDERS:
      // The database has ON DELETE CASCADE configured, which should 
      // automatically delete linked skills. However, if that constraint 
      // is ever misconfigured, we manually delete them here to prevent 
      // orphaned skills from lingering on the profile.
      await supabase
        .from('skills')
        .delete()
        .eq('experience_id', id)

      // 5. Update the UI instantly by removing the deleted item from state.
      setExperiences((prev) => prev.filter((exp) => exp.id !== id))

      // 6. REAL-TIME SYNC: Dispatch a custom browser event.
      // The global Sidebar and Dashboard are listening for this event. 
      // When they hear it, they will re-fetch their data so the Profile 
      // Strength percentage updates instantly without a page refresh.
      window.dispatchEvent(new Event('vouch-data-updated'))

    } catch (err: any) {
      console.error('Error deleting experience:', err)
      alert(err.message || 'Failed to delete experience.')
    } finally {
      // 7. Clear the loading state.
      setDeletingId(null)
    }
  }

  const handleOpenEdit = (exp: Experience) => {
    // Pre-fill the modal form with the current experience data.
    setEditingExp(exp)
    setEditTitle(exp.title || '')
    setEditType(exp.type || '')
    setEditDescription(exp.description || '')
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExp) return

    setSavingEdit(true)

    try {
      // 1. Update the database row.
      const { error } = await supabase
        .from('experiences')
        .update({
          title: editTitle,
          type: editType,
          description: editDescription, 
        })
        .eq('id', editingExp.id)

      if (error) throw error

      // 2. Update the UI state so the user sees the changes immediately.
      setExperiences((prev) =>
        prev.map((exp) =>
          exp.id === editingExp.id ? { ...exp, title: editTitle, type: editType, description: editDescription } : exp
        )
      )

      // 3. Close the modal.
      setEditingExp(null)

      // 4. REAL-TIME SYNC: Dispatch the event so the Sidebar/Dashboard update.
      window.dispatchEvent(new Event('vouch-data-updated'))

    } catch (err: any) {
      console.error('Error updating experience:', err)
      alert(err.message || 'Failed to update experience.')
    } finally {
      setSavingEdit(false)
    }
  }

  // ==========================================
  // 6. LOADING SKELETON
  // ==========================================
  // Shows a pulsing placeholder UI while waiting for the database fetch.
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950 pb-20 animate-pulse transition-colors duration-300">
        <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="h-28 bg-slate-200 dark:bg-slate-800" />
            <div className="px-5 pb-7 sm:px-8">
              <div className="-mt-12 flex items-end gap-4">
                <div className="h-24 w-24 rounded-3xl bg-slate-300 dark:bg-slate-700 border-4 border-white dark:border-slate-900" />
                <div className="pb-2 space-y-3">
                  <div className="h-6 w-48 bg-slate-300 dark:bg-slate-700 rounded" />
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
              <div className="mt-6 h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ==========================================
  // 7. HELPER CALCULATIONS
  // ==========================================
  
  // Extracts initials for the avatar (e.g., "Thabo Mokoena" -> "TM").
  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'U'

  // DEDUPLICATION: If the AI extracted "Customer Service" from two different 
  // experiences, the database will have two separate rows. We use a Map to 
  // deduplicate them by name so the UI only shows each skill once.
  const uniqueSkills = Array.from(
    new Map(skills.map(skill => [skill.name, skill])).values()
  )

  // DYNAMIC PROFILE STRENGTH MATH:
  // Basic Details = 30%, Bio = 20%, Skills = 25%, Experience = 25%.
  let score = 0
  if (profile?.full_name && profile?.location) score += 30
  if (profile?.bio) score += 20
  if (skills.length > 0) score += 25
  if (experiences.length > 0) score += 25

  // ==========================================
  // 8. RENDER UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950 pb-20 transition-colors duration-300">
      
      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        
        {/* --- PROFILE HEADER CARD --- */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300">
          <div className="h-28 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500" />
          
          <div className="px-5 pb-7 sm:px-8">
            <div className="-mt-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              
              <div className="flex items-end gap-4">
                {/* Avatar Circle */}
                <div className="grid h-24 w-24 place-items-center rounded-3xl border-4 border-white dark:border-slate-900 bg-blue-100 dark:bg-blue-900/50 text-2xl font-extrabold text-blue-700 dark:text-blue-300 shadow-sm">
                  {initials}
                </div>
                
                {/* Name and Location */}
                <div className="pb-1">
                  <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">
                    {profile?.full_name || 'Your Name'}
                  </h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <Icon name="location" size={15} />
                    {profile?.location || 'Location not set'}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button kind="secondary" onClick={() => router.push('/profile/edit')}>
                  <Icon name="edit" size={17} />
                  Edit
                </Button>
                <Button kind="primary" onClick={shareProfile}>
                  <Icon name="arrow" size={17} />
                  Share
                </Button>
              </div>
            </div>
            
            {/* Bio */}
            <p className="mt-6 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              {profile?.bio || 'No bio added yet. Tell employers a bit about yourself.'}
            </p>
          </div>
        </div>

        {/* --- MAIN GRID --- */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          
          <div className="space-y-5">
            
            {/* SKILLS SECTION */}
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Skills</h2>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                  Self-reported
                </span>
              </div>
              
              <div className="mt-5 flex flex-wrap gap-2">
                {uniqueSkills.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No skills added yet. Log an experience to get AI suggestions!</p>
                ) : (
                  uniqueSkills.map((skill) => (
                    <span 
                      key={skill.id} 
                      className="rounded-xl border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 text-sm font-bold text-blue-700 dark:text-blue-300" 
                    >
                      {skill.name}
                    </span>
                  ))
                )}
              </div>
            </section>

            {/* EXPERIENCE TIMELINE SECTION */}
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-colors duration-300">
              <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Experience</h2>
              
              <div className="mt-5 space-y-6">
                {experiences.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No experience logged yet.</p>
                ) : (
                  experiences.map((exp) => (
                    <div 
                      key={exp.id}
                      className="relative flex items-start justify-between gap-4 pl-7 before:absolute before:left-[5px] before:top-6 before:h-[calc(100%+1.5rem)] before:w-px before:bg-slate-200 dark:before:bg-slate-700 last:before:hidden" 
                    >
                      {/* Timeline dot */}
                      <span className="absolute left-0 top-1 h-3 w-3 rounded-full border-[3px] border-blue-100 dark:border-slate-800 bg-blue-600" />
                      
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{exp.title}</p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          {exp.type} · {new Date(exp.created_at).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}
                        </p>
                        {exp.description && (
                           <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{exp.description}</p>
                        )}
                      </div>

                      {/* Edit / Delete Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(exp)}
                          title="Edit experience"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/50 dark:hover:text-blue-400 transition cursor-pointer"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(exp.id)}
                          disabled={deletingId === exp.id}
                          title="Delete experience"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/50 dark:hover:text-rose-400 transition cursor-pointer disabled:opacity-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* --- PROFILE STRENGTH SIDEBAR --- */}
          <aside className="space-y-5">
            <div className="rounded-2xl bg-slate-950 dark:bg-slate-900 border dark:border-slate-800 p-6 text-white transition-colors duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">Profile strength</p>
                  <p className="mt-1 text-xs text-slate-400">Self-reported</p>
                </div>
                <p className="text-3xl font-extrabold">{score}%</p>
              </div>
              
              <div className="mt-5 h-2 rounded-full bg-slate-700">
                <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${score}%` }} />
              </div>
              
              <p className="mt-4 text-xs leading-5 text-slate-300">
                {score === 100 
                  ? 'Your profile is complete and ready to impress!' 
                  : 'Add more details, skills, or experience to reach 100%.'}
              </p>
            </div>
          </aside>

        </div>
      </main>

      {/* --- EDIT EXPERIENCE MODAL --- */}
      {/* Only renders if editingExp state is not null. */}
      {editingExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Experience</h3>
            
            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Title / Role</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Type / Category</label>
                <input
                  type="text"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none dark:text-white min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExp(null)}
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}