'use client'

// ==========================================
// EMPLOYER DASHBOARD PAGE
// ==========================================
// This page represents the "Demand Side" of the Vouch platform. 
// It allows employers to view candidate profiles, see their trust scores, 
// fund escrow for a job, and post new opportunities to the database.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon } from '@/components/ui'
import confetti from 'canvas-confetti'

// ==========================================
// 1. TYPESCRIPT INTERFACES
// ==========================================
interface ApplicantProfile {
  id: string
  full_name: string | null
  location: string | null
  trust_score: number | null
  skills: { name: string }[]
  experiences: { title: string; evidence_url: string | null }[]
}

export default function EmployerPage() {
  const router = useRouter()
  
  // --- CORE STATE ---
  const [applicants, setApplicants] = useState<ApplicantProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [escrowFunded, setEscrowFunded] = useState(false)
  const [employerName, setEmployerName] = useState('Langa Corner Store')
  
  // --- MODAL STATES ---
  const [showProModal, setShowProModal] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)

  // --- POST JOB FORM STATES ---
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [jobPay, setJobPay] = useState('')
  const [jobDuration, setJobDuration] = useState('1')
  const [jobLocation, setJobLocation] = useState('Windhoek')
  const [posting, setPosting] = useState(false)

  // ==========================================
  // 2. FETCH DATA ON LOAD
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.replace('/login?redirect=/employer')
        return 
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()
        
      if (profile?.full_name) {
        setEmployerName(profile.full_name)
      }

      // Fetch mock applicants for the demo
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, location, trust_score, skills(name), experiences(title, evidence_url)')
        .neq('id', session.user.id) 
        .limit(1)
      
      if (data && data.length > 0) setApplicants(data as ApplicantProfile[])
      setLoading(false)
    }
    loadData()
  }, [router])

  // ==========================================
  // 3. ACTIONS
  // ==========================================
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleFundEscrow = () => {
    setEscrowFunded(true)
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
  }

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setPosting(true)

    // Insert the new job into the micro_tasks table.
    // Note: If this fails, it is because Supabase RLS blocks inserts by default.
    // You must run this SQL in Supabase: CREATE POLICY "Allow inserts" ON public.micro_tasks FOR INSERT TO authenticated WITH CHECK (true);
    const { error } = await supabase
      .from('micro_tasks')
      .insert({
        title: jobTitle,
        description: jobDescription,
        pay_amount: parseInt(jobPay),
        duration_days: parseInt(jobDuration),
        employer_name: employerName,
        location: jobLocation,
        status: 'open',
        skills_required: [] 
      })

    if (error) {
      alert("Error posting job: " + error.message)
      setPosting(false)
      return
    }

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    setShowPostModal(false)
    setPosting(false)
    
    // Reset form
    setJobTitle('')
    setJobDescription('')
    setJobPay('')
    setJobDuration('1')
    
    alert("Opportunity posted successfully! It is now live on the youth Task Board.")
  }

  // ==========================================
  // 4. SKELETON LOADER
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 pb-20 animate-pulse transition-colors duration-200">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-5 lg:px-8 flex items-center justify-between">
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </header>
        <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="h-20 w-full rounded-2xl bg-slate-200 dark:bg-slate-700 mb-6" />
          <div className="space-y-3 mb-8">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 w-64 bg-slate-300 dark:bg-slate-600 rounded" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-700" />
          </div>
        </main>
      </div>
    )
  }

  // ==========================================
  // 5. MAIN UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-5 lg:px-8 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
              <path d="m5 6 7 13 7-13h-4l-3 6-3-6H5Z" fill="currentColor" />
              <path d="m8 3 4 7 4-7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">Vouch</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 transition-colors">
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        
        {/* --- VOUCH PRO BANNER --- */}
        <div className="mb-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <span className="bg-amber-500 text-white p-2 rounded-lg"><Icon name="spark" size={18} /></span>
            <div>
              <p className="text-white font-bold text-sm">Upgrade to Vouch Pro</p>
              <p className="text-slate-300 text-xs">Get AI shortlisting, direct WhatsApp, & advanced filters.</p>
            </div>
          </div>
          <button onClick={() => setShowProModal(true)} className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition shadow-sm">
            View Plans
          </button>
        </div>

        {/* --- PAGE TITLE & POST BUTTON --- 
            FIXED: Replaced the custom <Button> with a standard HTML <button> 
            to guarantee the onClick event fires and opens the modal.
        */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 mt-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              EMPLOYER DASHBOARD
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight">
              {employerName}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Find capable young people for short, meaningful work.
            </p>
          </div>
          <div>
            <button 
              type="button"
              onClick={() => setShowPostModal(true)} 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
            >
              <Icon name="plus" size={18} /> Post an opportunity
            </button>
          </div>
        </div>

        {/* --- STATS ROW --- */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Open tasks</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">1</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">New applicants</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">1</p>
            <p className="mt-1 text-xs font-semibold text-emerald-600">+1 this week</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Shortlisted</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">1</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed hires</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">0</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          
          {/* --- APPLICANT VIEW --- */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6">
            <div className="flex justify-between">
              <h2 className="font-extrabold text-slate-950 dark:text-white">Recent applicants</h2>
            </div>

            <div className="mt-5 space-y-4">
              {applicants.length === 0 ? (
                <p className="text-sm text-slate-500">No applicants yet.</p>
              ) : (
                applicants.map((user) => {
                  let calculatedTrust = 40;
                  if (user.skills?.length > 0) calculatedTrust += 20;
                  if (user.experiences?.[0]) calculatedTrust += 15;
                  if (user.experiences?.[0]?.evidence_url) calculatedTrust += 15;

                  return (
                    <div key={user.id} className="flex flex-col gap-4 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-700">
                          {user.full_name?.substring(0, 2).toUpperCase() || 'U'}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.full_name}</p>
                          <p className="text-xs text-slate-400">{user.location}</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 border border-emerald-100 dark:border-emerald-900 text-center">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Trust</p>
                          <p className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">{calculatedTrust}/100</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {user.skills?.map((s, i) => (
                          <span key={i} className="rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                            {s.name}
                          </span>
                        ))}
                      </div>

                      {user.experiences?.[0] && (
                        <div className="mt-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-100 dark:border-blue-900/50">
                          <p className="text-xs font-bold text-blue-800 mb-1">Latest Experience</p>
                          <p className="text-sm font-semibold text-slate-800">{user.experiences[0].title}</p>
                          {user.experiences[0].evidence_url && (
                            <a href={user.experiences[0].evidence_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                              <Icon name="arrow" size={12} /> View Evidence / Proof
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* --- ESCROW --- */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6">
              <h3 className="font-extrabold text-slate-950 dark:text-white mb-2">Secure Hiring</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Vouch uses Escrow to protect youth from unpaid work. Funds are held securely until completion.
              </p>
              {escrowFunded ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-center">
                  <div className="flex justify-center mb-2">
                    <Icon name="check" size={24} />
                  </div>
                  <p className="font-bold">Escrow Funded!</p>
                </div>
              ) : (
                <button onClick={handleFundEscrow} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md flex justify-center items-center gap-2">
                  <Icon name="lock" size={16} /> Fund Escrow
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ==========================================
          POST JOB MODAL
          ==========================================
          Renders only when 'showPostModal' is true.
      */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowPostModal(false)}>
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPostModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">Post an Opportunity</h2>
            
            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Job Title</label>
                <input type="text" required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Weekend Shop Assistant" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-600 outline-none dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Description</label>
                <textarea required value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="What will they be doing?" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-600 outline-none dark:text-white min-h-[80px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Pay (N$)</label>
                  <input type="number" required value={jobPay} onChange={(e) => setJobPay(e.target.value)} placeholder="850" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-600 outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Duration (Days)</label>
                  <input type="number" required value={jobDuration} onChange={(e) => setJobDuration(e.target.value)} min="1" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-600 outline-none dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Location</label>
                <select value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-600 outline-none dark:text-white">
                  <option>Windhoek</option>
                  <option>Swakopmund</option>
                  <option>Oshakati</option>
                  <option>Remote</option>
                </select>
              </div>
              <button type="submit" disabled={posting} className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50">
                {posting ? 'Posting...' : 'Post Job'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- VOUCH PRO MODAL --- */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowProModal(false)}>
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowProModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            <h2 className="text-2xl font-extrabold text-center mb-2 text-slate-900 dark:text-white">Vouch Pro</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">Supercharge your hiring.</p>
            <button onClick={() => setShowProModal(false)} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl">Subscribe for N$499/mo</button>
          </div>
        </div>
      )}
    </div>
  )
}