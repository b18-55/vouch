'use client'
// 'use client' is a Next.js directive. It tells Next.js that this component 
// must run in the browser (Client Component) rather than purely on the server.
// We need this because we use React hooks (state, refs) and browser APIs (canvas/image generation).

// --- IMPORTS ---
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon } from '@/components/ui'
// We import html-to-image to capture the profile card as a PNG file for offline sharing.
import { toPng } from 'html-to-image'

// ==========================================
// 1. MODERN SVG ICONS
// ==========================================
const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
)
const BadgeCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd"/></svg>
)
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
)
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
)
const ShareNodesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
)
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
)

// ==========================================
// 2. TYPESCRIPT TYPES
// ==========================================
type Profile = {
  full_name: string | null
  location: string | null
  bio: string | null
  trust_score: number | null
  public_slug: string | null
}

type Skill = { id: string; name: string }

type Experience = { 
  id: string
  title: string
  type: string
  description?: string 
  evidence_url?: string | null 
  created_at: string 
}

export default function ProfilePage() {
  const router = useRouter()
  
  // --- REFS & STATE ---
  // We use a Ref to grab the HTML element of the profile card for the download feature.
  const profileCardRef = useRef<HTMLDivElement>(null)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  // State to control the Custom Share Menu Modal
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const [showAllSkills, setShowAllSkills] = useState(false)
  const [showAllExperiences, setShowAllExperiences] = useState(false)

  const [deletingId, setDeletingId] = useState<string | null>(null) 
  const [editingExp, setEditingExp] = useState<Experience | null>(null) 
  const [editTitle, setEditTitle] = useState('') 
  const [editType, setEditType] = useState('') 
  const [editDescription, setEditDescription] = useState('') 
  const [savingEdit, setSavingEdit] = useState(false) 

  // --- FETCH DATA ON LOAD ---
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
  // ACTION 1: SHARE LINK (Text/WhatsApp)
  // ==========================================
  const shareLink = async () => {
    setShowShareMenu(false) // Close the menu

    const slug = profile?.public_slug
    if (!slug) return alert("Profile link not ready yet. Try reloading.")
    
    const url = `${window.location.origin}/p/${slug}`
    const text = 'Check out my verified skills on Vouch!'
    const shareData = { title: 'My Vouch Profile', text: text, url: url }
    
    // Use native OS share sheet if available (mobile), else fallback to WhatsApp Web (desktop)
    if (navigator.share) {
      try { await navigator.share(shareData) } catch (err) { console.log('Share cancelled') }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
    }
  }

  // ==========================================
  // ACTION 2: DOWNLOAD AS IMAGE
  // ==========================================
  // This function uses the 'html-to-image' library to convert the profile card
  // into a PNG file. This is perfect for users with low data who want to 
  // save the image and share it via WhatsApp or email later.
  const downloadProfile = async () => {
    if (!profileCardRef.current) return

    try {
      setDownloading(true)
      
      // Generate the PNG from the referenced HTML element
      const dataUrl = await toPng(profileCardRef.current, { 
        cacheBust: true,
        backgroundColor: '#0f172a' // Fallback dark background to prevent transparent edges
      })
      
      // Create a temporary download link and click it programmatically
      const link = document.createElement('a')
      link.download = `${profile?.full_name?.replace(/\s+/g, '-').toLowerCase() || 'vouch'}-profile.png`
      link.href = dataUrl
      link.click()
      
    } catch (err) {
      console.error('Error downloading image:', err)
      alert('Could not download the profile image. Please try again.')
    } finally {
      setDownloading(false)
      setShowShareMenu(false) // Close menu after download
    }
  }

  // ==========================================
  // EDIT & DELETE EXPERIENCE LOGIC
  // ==========================================
  const handleDeleteExperience = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return
    setDeletingId(id) 
    try {
      const { error: expError } = await supabase.from('experiences').delete().eq('id', id)
      if (expError) throw expError
      await supabase.from('skills').delete().eq('experience_id', id)
      setExperiences((prev) => prev.filter((exp) => exp.id !== id))
      window.dispatchEvent(new Event('vouch-data-updated'))
    } catch (err: unknown) {
      console.error('Error deleting experience:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete experience.')
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
      setExperiences((prev) =>
        prev.map((exp) => exp.id === editingExp.id ? { ...exp, title: editTitle, type: editType, description: editDescription } : exp)
      )
      setEditingExp(null)
      window.dispatchEvent(new Event('vouch-data-updated'))
    } catch (err: unknown) {
      console.error('Error updating experience:', err)
      alert(err instanceof Error ? err.message : 'Failed to update experience.')
    } finally {
      setSavingEdit(false)
    }
  }

  // ==========================================
  // LOADING SKELETON
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950 pb-20 animate-pulse transition-colors duration-300">
        <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="h-32 sm:h-40 bg-slate-200 dark:bg-slate-800" />
            <div className="px-5 sm:px-8 pb-8">
              <div className="-mt-16 sm:-mt-20 flex flex-col sm:flex-row items-center sm:items-end gap-5">
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl bg-slate-300 dark:bg-slate-700 border-4 border-white dark:border-slate-900" />
                <div className="pb-2 space-y-3 flex flex-col items-center sm:items-start">
                  <div className="h-8 w-48 bg-slate-300 dark:bg-slate-700 rounded" />
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
  // HELPER CALCULATIONS
  // ==========================================
  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'U'

  const uniqueSkills = Array.from(new Map(skills.map(skill => [skill.name, skill])).values())

  let score = 0
  if (profile?.full_name && profile?.location) score += 30
  if (profile?.bio) score += 20
  if (skills.length > 0) score += 25
  if (experiences.length > 0) score += 25

  let dynamicTrust = 40;
  if (profile?.bio) dynamicTrust += 10;
  if (skills.length > 0) dynamicTrust += 20;
  if (experiences.length > 0) dynamicTrust += 15;
  if (experiences.some(exp => exp.evidence_url)) dynamicTrust += 15;

  const displayedSkills = showAllSkills ? uniqueSkills : uniqueSkills.slice(0, 8)
  const displayedExperiences = showAllExperiences ? experiences : experiences.slice(0, 3)

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950 pb-20 transition-colors duration-300">
      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        
        {/* 
          ==========================================
          PROFILE HEADER CARD
          ==========================================
          We attach the `ref={profileCardRef}` to this div. 
          When the user clicks "Download", the html-to-image library captures 
          everything inside this div and turns it into a PNG.
        */}
        <div ref={profileCardRef} className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500" />
          
          <div className="px-5 pb-8 sm:px-8">
            <div className="-mt-16 sm:-mt-20 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
              
              {/* Left Side: Avatar + Info */}
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-5 flex-1 min-w-0 w-full">
                <div className="grid h-24 w-24 sm:h-32 sm:w-32 shrink-0 place-items-center rounded-3xl border-4 border-white dark:border-slate-900 bg-gradient-to-br from-blue-500 to-cyan-400 text-3xl font-extrabold text-white shadow-lg">
                  {initials}
                </div>
                
                <div className="flex flex-col items-center md:items-start text-center md:text-left pb-1 md:pb-2 flex-1 min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight break-words w-full">
                    {profile?.full_name || 'Your Name'}
                  </h1>
                  <p className="mt-1.5 flex items-center justify-center md:justify-start gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-300">
                    <MapPinIcon />
                    <span className="truncate">{profile?.location || 'Location not set'}</span>
                  </p>
                  
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
                    <BadgeCheckIcon /> Trust Score: {dynamicTrust}/100
                  </div>
                </div>
              </div>
              
              {/* Right Side: Action Buttons */}
              <div className="flex w-full md:w-auto gap-3 justify-center md:justify-end shrink-0">
                <button onClick={() => alert("Payment gateway coming soon!")} className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-4 py-2.5 text-sm font-bold border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition shadow-sm">
                  <SparklesIcon /> Boost
                </button>
                
                {/* 
                  OPEN SHARE MENU BUTTON 
                  We no longer call shareProfile directly. Instead, we open our custom modal.
                */}
                <button onClick={() => setShowShareMenu(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-2.5 text-sm font-bold shadow-md hover:bg-blue-700 transition">
                  <ShareNodesIcon /> Share
                </button>
              </div>
            </div>
            
            {/* --- BIO SECTION WITH INLINE EDIT BUTTON --- */}
            <div className="mt-8 flex items-start justify-between gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-4">
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 text-left">
                {profile?.bio || 'Add a bio to attract more opportunities and build trust with employers.'}
              </p>
              <button 
                onClick={() => router.push('/profile/edit')} 
                title="Edit Profile"
                className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-colors"
              >
                <PencilIcon />
              </button>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT GRID (Skills & Experience) --- */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            
            {/* SKILLS SECTION */}
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
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
                  className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {showAllSkills ? 'Show less' : `See all ${uniqueSkills.length} skills`}
                </button>
              )}
            </section>

            {/* EXPERIENCE TIMELINE SECTION */}
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
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
                      <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-[3px] border-blue-100 dark:border-slate-800 bg-blue-600" />
                      
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{exp.title}</p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          {exp.type} · {new Date(exp.created_at).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}
                        </p>
                        {exp.description && (
                           <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{exp.description}</p>
                        )}
                        
                        {exp.evidence_url && (
                          <a href={exp.evidence_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                            <Icon name="arrow" size={12} /> Evidence Attached
                          </a>
                        )}
                      </div>

                      {/* Edit/Delete Buttons */}
                      <div className="flex items-center gap-1">
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
                  className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {showAllExperiences ? 'Show less' : `See all ${experiences.length} experiences`}
                </button>
              )}
            </section>
          </div>

          {/* PROFILE STRENGTH SIDEBAR */}
          <aside className="space-y-6">
            <div className="rounded-2xl bg-slate-950 dark:bg-slate-900 border dark:border-slate-800 p-6 text-white shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">Profile strength</p>
                  <p className="mt-1 text-xs text-slate-400">AI-Extracted & Vouched</p>
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

      {/* ==========================================
          CUSTOM SHARE MENU MODAL
          ==========================================
          Instead of instantly opening the native share sheet, we present a 
          clean bottom-sheet style menu giving the user two clear options:
          1. Share as a link (WhatsApp/SMS)
          2. Download as an image (Offline sharing)
      */}
      {showShareMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowShareMenu(false)}>
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Share Profile</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">How would you like to send your profile?</p>
            
            <div className="space-y-3">
              {/* OPTION 1: SHARE LINK */}
              <button onClick={shareLink} className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ShareNodesIcon />
                </span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Share Link</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Send via WhatsApp or copy URL</p>
                </div>
              </button>

              {/* OPTION 2: DOWNLOAD IMAGE */}
              <button onClick={downloadProfile} disabled={downloading} className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group disabled:opacity-50">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <DownloadIcon />
                </span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{downloading ? 'Saving...' : 'Download Image'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Save as PNG to send offline</p>
                </div>
              </button>
            </div>
            
            <button onClick={() => setShowShareMenu(false)} className="mt-4 w-full py-2 text-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          EDIT EXPERIENCE MODAL
          ========================================== */}
      {editingExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
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