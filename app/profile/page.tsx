'use client'
// 'use client' is a Next.js directive. It tells Next.js that this component 
// must run in the browser (Client Component) rather than purely on the server.

// --- IMPORTS ---
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  public_slug: string | null // Used for the public shareable link (/p/[slug])
}

type Skill = { 
  id: string // Required for React keys so it doesn't yell at us
  name: string 
}

type Experience = { 
  id: string
  title: string
  type: string
  description?: string 
  evidence_url?: string | null // Added for the proof link
  created_at: string 
}

export default function ProfilePage() {
  const router = useRouter()
  
  // --- CORE STATE ---
  const [profile, setProfile] = useState<Profile | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  // --- SEE MORE TOGGLES ---
  // Keeps the profile clean on mobile. If true, shows all items.
  const [showAllSkills, setShowAllSkills] = useState(false)
  const [showAllExperiences, setShowAllExperiences] = useState(false)

  // --- UI INTERACTION STATE ---
  const [deletingId, setDeletingId] = useState<string | null>(null) 
  const [editingExp, setEditingExp] = useState<Experience | null>(null) 
  const [editTitle, setEditTitle] = useState('') 
  const [editType, setEditType] = useState('') 
  const [editDescription, setEditDescription] = useState('') 
  const [savingEdit, setSavingEdit] = useState(false) 

  // ==========================================
  // 2. FETCH DATA ON LOAD
  // ==========================================
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      const [profileRes, skillsRes, expRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('skills').select('id, name').eq('profile_id', session.user.id),
        supabase.from('experiences').select('*').eq('profile_id', session.user.id).order('created_at', { ascending: false })
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (skillsRes.data) setSkills(skillsRes.data)
      if (expRes.data) setExperiences(expRes.data)

      setLoading(false)
    }
    loadProfile()
  }, [router]) 

  // ==========================================
  // 3. SHARE PROFILE LOGIC
  // ==========================================
  const shareProfile = async () => {
    const slug = profile?.public_slug
    if (!slug) return alert("Profile link not ready yet. Try reloading.")

    const url = `${window.location.origin}/p/${slug}`
    const text = 'Check out my verified skills on Vouch!'
    
    const shareData = { title: 'My Vouch Profile', text: text, url: url }

    // Use native OS share on phones, fallback to WhatsApp on desktop
    if (navigator.share) {
      try { await navigator.share(shareData) } catch (err) { console.log('Share cancelled') }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
    }
  }

  // ==========================================
  // 4. EDIT & DELETE LOGIC
  // ==========================================
  
  const handleDeleteExperience = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return
    setDeletingId(id) 

    try {
      const { error: expError } = await supabase.from('experiences').delete().eq('id', id)
      if (expError) throw expError

      // The database has ON DELETE CASCADE, but we manually delete skills just in case.
      await supabase.from('skills').delete().eq('experience_id', id)

      // Remove it from the UI instantly
      setExperiences((prev) => prev.filter((exp) => exp.id !== id))

      // Dispatch a custom event so the Sidebar/Dashboard can update their stats
      window.dispatchEvent(new Event('vouch-data-updated'))

    } catch (err: unknown) {
      console.error('Error deleting experience:', err)
      const message = err instanceof Error ? err.message : 'Failed to delete experience.'
      alert(message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleOpenEdit = (exp: Experience) => {
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
      const { error } = await supabase
        .from('experiences')
        .update({ title: editTitle, type: editType, description: editDescription })
        .eq('id', editingExp.id)

      if (error) throw error

      // Update the UI instantly
      setExperiences((prev) =>
        prev.map((exp) => exp.id === editingExp.id ? { ...exp, title: editTitle, type: editType, description: editDescription } : exp)
      )

      setEditingExp(null)
      window.dispatchEvent(new Event('vouch-data-updated'))

    } catch (err: unknown) {
      console.error('Error updating experience:', err)
      const message = err instanceof Error ? err.message : 'Failed to update experience.'
      alert(message)
    } finally {
      setSavingEdit(false)
    }
  }

  // ==========================================
  // 5. LOADING SKELETON
  // ==========================================
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
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ==========================================
  // 6. HELPER CALCULATIONS
  // ==========================================
  
  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'U'

  // Deduplicate skills so "Baking" only shows once, even if learned in 3 places.
  const uniqueSkills = Array.from(new Map(skills.map(skill => [skill.name, skill])).values())

  // Dynamic Profile Strength calculation
  let score = 0
  if (profile?.full_name && profile?.location) score += 30
  if (profile?.bio) score += 20
  if (skills.length > 0) score += 25
  if (experiences.length > 0) score += 25

  // Dynamic Trust Score Calculation (Max 90)
  let dynamicTrust = 40;
  if (profile?.bio) dynamicTrust += 10;
  if (skills.length > 0) dynamicTrust += 20;
  if (experiences.length > 0) dynamicTrust += 15;
  if (experiences.some(exp => exp.evidence_url)) dynamicTrust += 15;

  // Slice the arrays based on the "See More" state
  const displayedSkills = showAllSkills ? uniqueSkills : uniqueSkills.slice(0, 8)
  const displayedExperiences = showAllExperiences ? experiences : experiences.slice(0, 3)

  // ==========================================
  // 7. RENDER UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950 pb-20 transition-colors duration-300">
      
      {/* 
        PRINT CSS: When the user clicks "Save PDF", the browser triggers window.print().
        This style block ensures ONLY the profile cards are printed, hiding the background, 
        action buttons, and the sidebar.
      */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-card { border: none !important; box-shadow: none !important; padding: 0 !important; }
          /* Reset the negative margin so the avatar doesn't get cut off on paper */
          .print-mt-0 { margin-top: 0 !important; }
        }
      `}</style>

      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        
        {/* --- PROFILE HEADER CARD --- */}
        <div className="print-card overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="h-28 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 no-print" />
          
          <div className="px-5 pb-7 sm:px-8">
            {/* Added print-mt-0 to fix the cut-off avatar when the banner is hidden */}
            <div className="-mt-12 print-mt-0 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              
              <div className="flex items-end gap-4">
                <div className="grid h-24 w-24 place-items-center rounded-3xl border-4 border-white dark:border-slate-900 bg-blue-100 dark:bg-blue-900/50 text-2xl font-extrabold text-blue-700 dark:text-blue-300 shadow-sm">
                  {initials}
                </div>
                <div className="pb-1">
                  <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">
                    {profile?.full_name || 'Your Name'}
                  </h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <Icon name="location" size={15} />
                    {profile?.location || 'Location not set'}
                  </p>
                  
                  {/* Dynamic Trust Score Badge */}
                  <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <Icon name="check" size={12} /> Trust Score: {dynamicTrust}/100
                  </div>
                </div>
              </div>
              
              {/* Action Buttons (Hidden during print) */}
              <div className="no-print flex gap-2">
                <Button kind="secondary" onClick={() => window.print()} className="bg-slate-100 text-slate-700 border-slate-200">
                  📄 Save PDF
                </Button>
                <Button kind="secondary" onClick={() => alert("Payment gateway coming soon!")} className="bg-amber-50 text-amber-700 border-amber-200">
                  <Icon name="spark" size={16} /> Boost
                </Button>
                <Button kind="secondary" onClick={() => router.push('/profile/edit')}>
                  <Icon name="edit" size={17} /> Edit
                </Button>
                <Button kind="primary" onClick={shareProfile}>
                  <Icon name="arrow" size={17} /> Share
                </Button>
              </div>
            </div>
            
            <p className="mt-6 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              {profile?.bio || 'No bio added yet. Tell employers a bit about yourself.'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          
          <div className="space-y-5">
            
            {/* --- SKILLS SECTION --- */}
            <section className="print-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Skills</h2>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                  AI-Extracted & Vouched
                </span>
              </div>
              
              <div className="mt-5 flex flex-wrap gap-2">
                {uniqueSkills.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No skills added yet. Log an experience!</p>
                ) : (
                  displayedSkills.map((skill) => (
                    <span 
                      key={skill.id} 
                      className="rounded-xl border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 text-sm font-bold text-blue-700 dark:text-blue-300" 
                    >
                      {skill.name}
                    </span>
                  ))
                )}
              </div>

              {uniqueSkills.length > 8 && (
                <button 
                  onClick={() => setShowAllSkills(!showAllSkills)}
                  className="no-print mt-4 text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {showAllSkills ? 'Show less' : `See all ${uniqueSkills.length} skills`}
                </button>
              )}
            </section>

            {/* --- EXPERIENCE TIMELINE SECTION --- */}
            <section className="print-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Experience</h2>
              
              <div className="mt-5 space-y-6">
                {experiences.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No experience logged yet.</p>
                ) : (
                  displayedExperiences.map((exp) => (
                    <div 
                      key={exp.id}
                      className="relative flex items-start justify-between gap-4 pl-7 before:absolute before:left-[5px] before:top-6 before:h-[calc(100%+1.5rem)] before:w-px before:bg-slate-200 dark:before:bg-slate-700 last:before:hidden" 
                    >
                      <span className="absolute left-0 top-1 h-3 w-3 rounded-full border-[3px] border-blue-100 dark:border-slate-800 bg-blue-600" />
                      
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{exp.title}</p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          {exp.type} · {new Date(exp.created_at).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}
                        </p>
                        {exp.description && (
                           <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{exp.description}</p>
                        )}
                        
                        {/* Evidence Badge */}
                        {exp.evidence_url && (
                          <a href={exp.evidence_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                            <Icon name="arrow" size={12} /> Evidence Attached
                          </a>
                        )}
                      </div>

                      {/* Edit / Delete Buttons (Hidden during print) */}
                      <div className="no-print flex items-center gap-1">
                        <button type="button" onClick={() => handleOpenEdit(exp)} title="Edit" className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/50 transition">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button type="button" onClick={() => handleDeleteExperience(exp.id)} disabled={deletingId === exp.id} title="Delete" className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/50 transition disabled:opacity-50">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {experiences.length > 3 && (
                <button 
                  onClick={() => setShowAllExperiences(!showAllExperiences)}
                  className="no-print mt-6 text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {showAllExperiences ? 'Show less' : `See all ${experiences.length} experiences`}
                </button>
              )}
            </section>
          </div>

          {/* --- PROFILE STRENGTH SIDEBAR (Hidden during print) --- */}
          <aside className="no-print space-y-5">
            <div className="rounded-2xl bg-slate-950 dark:bg-slate-900 border dark:border-slate-800 p-6 text-white">
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
                {score === 100 ? 'Your profile is complete!' : 'Add more details to reach 100%.'}
              </p>
            </div>
          </aside>

        </div>
      </main>

      {/* --- EDIT EXPERIENCE MODAL (Hidden during print) --- */}
      {editingExp && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Experience</h3>
            
            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Title / Role</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Type / Category</label>
                <input type="text" value={editType} onChange={(e) => setEditType(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Description</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none dark:text-white min-h-[100px]" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingExp(null)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">Cancel</button>
                <button type="submit" disabled={savingEdit} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition disabled:opacity-50">{savingEdit ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}