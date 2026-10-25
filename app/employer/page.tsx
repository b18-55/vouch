'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button, Icon, PageTitle } from '@/components/ui'
import confetti from 'canvas-confetti'

// --- TYPESCRIPT INTERFACE ---
interface ApplicantProfile {
  id: string
  full_name: string | null
  location: string | null
  trust_score: number | null
  skills: { name: string }[]
  experiences: { title: string; evidence_url: string | null }[]
}

/**
 * Employer Dashboard Component
 * 
 * Architecture:
 * Represents the "Demand Side" of the platform. It demonstrates how an employer 
 * views talent, evaluates trust, and secures work through escrow.
 * 
 * Trust Score Logic:
 * Dynamically calculates the applicant's trust score based on profile completeness 
 * and evidence provided. (Max 90 points visible here, as bio isn't fetched).
 */
export default function EmployerPage() {
  const [applicants, setApplicants] = useState<ApplicantProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [escrowFunded, setEscrowFunded] = useState(false)
  const [showProModal, setShowProModal] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, location, trust_score, skills(name), experiences(title, evidence_url)')
        .limit(1)
      
      if (data && data.length > 0) setApplicants(data as ApplicantProfile[])
      setLoading(false)
    }
    loadData()
  }, [])

  const handleFundEscrow = () => {
    setEscrowFunded(true)
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      
      {/* Header */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-5 lg:px-8 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
              <path d="m5 6 7 13 7-13h-4l-3 6-3-6H5Z" fill="currentColor" />
              <path d="m8 3 4 7 4-7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">Vouch</span>
          <span className="ml-2 rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            Employer Workspace
          </span>
        </div>

        <Link href="/roles" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">
          Back to Youth App
        </Link>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        
        {/* Vouch Pro SaaS Banner */}
        <div className="mb-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <span className="bg-amber-500 text-white p-2 rounded-lg"><Icon name="spark" size={18} /></span>
            <div>
              <p className="text-white font-bold text-sm">Upgrade to Vouch Pro</p>
              <p className="text-slate-300 text-xs">Get AI shortlisting, direct WhatsApp, & advanced filters.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowProModal(true)} 
            className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition shadow-sm"
          >
            View Plans
          </button>
        </div>

        <PageTitle 
          eyebrow="LANGA CORNER STORE" 
          title="Hiring made simpler" 
          text="Find capable young people for short, meaningful work." 
          action={<Button icon="plus">Post an opportunity</Button>} 
        />

        {/* Stats Row */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 transition-colors duration-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Open tasks</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">1</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 transition-colors duration-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">New applicants</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">1</p>
            <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">+1 this week</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 transition-colors duration-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Shortlisted</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">1</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 transition-colors duration-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Completed hires</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">0</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          
          {/* Applicant View */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 transition-colors duration-200">
            <div className="flex justify-between">
              <h2 className="font-extrabold text-slate-950 dark:text-white">Recent applicants</h2>
              <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">View all</button>
            </div>

            <div className="mt-5 space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500 animate-pulse">Loading applicant data...</p>
              ) : applicants.length === 0 ? (
                <p className="text-sm text-slate-500">No applicants yet.</p>
              ) : (
                applicants.map((user) => {
                  const isNamibia = user.location?.toLowerCase().includes('namibia')
                  const currency = isNamibia ? 'N$' : 'R'

                  // --- DYNAMIC TRUST SCORE CALCULATION ---
                  // Base 40 points for having an account. 
                  // +20 for skills, +15 for experience, +15 for evidence URL. (Max 90)
                  let calculatedTrust = 40;
                  if (user.skills?.length > 0) calculatedTrust += 20;
                  if (user.experiences?.[0]) calculatedTrust += 15;
                  if (user.experiences?.[0]?.evidence_url) calculatedTrust += 15;

                  return (
                    <div key={user.id} className="flex flex-col gap-4 rounded-xl border border-slate-100 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-sm font-extrabold text-blue-700 dark:text-blue-300">
                          {user.full_name?.substring(0, 2).toUpperCase() || 'U'}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.full_name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{user.location}</p>
                        </div>
                        
                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 border border-emerald-100 dark:border-emerald-900 text-center">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Trust</p>
                          {/* Rendered the dynamically calculated score */}
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
                          <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">Latest Experience</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.experiences[0].title}</p>
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

          {/* Escrow & Hiring Tip Column */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 transition-colors duration-200">
              <h3 className="font-extrabold text-slate-950 dark:text-white mb-2">Secure Hiring</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Vouch uses Escrow to protect youth from unpaid work. Funds are held securely until completion.
              </p>
              
              {escrowFunded ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-center transition-all">
                  <div className="flex justify-center mb-2">
                    <Icon name="check" size={24} />
                  </div>
                  <p className="font-bold">Escrow Funded!</p>
                  <p className="text-xs mt-1">The youth has been notified to start work.</p>
                </div>
              ) : (
                <button onClick={handleFundEscrow} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md flex justify-center items-center gap-2">
                  <Icon name="lock" size={16} /> Fund Escrow
                </button>
              )}
            </div>

            <div className="rounded-2xl bg-slate-950 dark:bg-slate-800/80 dark:border dark:border-slate-700 p-6 text-white transition-colors duration-200">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Hiring tip</p>
              <h2 className="mt-3 text-xl font-extrabold">Focus on demonstrated skills, not formal titles.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Vouch profiles translate informal experience into relevant workplace capabilities.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Vouch Pro Modal */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-2xl font-extrabold text-center mb-2 text-slate-900 dark:text-white">Vouch Pro</h2>
            <p className="text-center text-slate-500 mb-6 text-sm">Supercharge your hiring.</p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <span className="text-emerald-500 flex items-center"><Icon name="check" size={16} /></span> Unlimited gig posting
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <span className="text-emerald-500 flex items-center"><Icon name="check" size={16} /></span> Direct WhatsApp messaging
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <span className="text-emerald-500 flex items-center"><Icon name="check" size={16} /></span> Advanced Trust Filters
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <span className="text-emerald-500 flex items-center"><Icon name="check" size={16} /></span> Instant Escrow clearing
              </div>
            </div>
            <button onClick={() => setShowProModal(false)} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition">
              Subscribe for N$499/mo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}