'use client'
// Client component: uses React hooks and fetches data from the browser.

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Icon } from '@/components/ui'

/**
 * StatsPage (Internal Impact Dashboard)
 * Hidden page (/stats) to show judges live database metrics during the pitch.
 */
export default function StatsPage() {
  
  const [stats, setStats] = useState({
    users: 0,
    experiences: 0,
    skills: 0,
    applications: 0,
    gigs: 0,
    totalIncome: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      
      // Run all queries in parallel for speed.
      const [
        usersRes, 
        expRes, 
        skillsRes, 
        appsRes, 
        gigsRes
      ] = await Promise.all([
        
        // Use { count: 'exact', head: true } so the DB only returns the number 
        // of rows, not the actual data. This is much faster and lighter.
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('experiences').select('*', { count: 'exact', head: true }),
        supabase.from('skills').select('*', { count: 'exact', head: true }),
        
        // Safety net: if the applications/gigs tables don't exist yet, 
        // the query fails silently and we handle it below.
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('gigs').select('amount_zar') 
      ])

      // Safely calculate total income. Defaults to [] if the gigs table is missing.
      const gigsData = gigsRes.data || []
      const income = gigsData.reduce((sum, gig) => sum + (gig.amount_zar || 0), 0)

      // Default to 0 if a count returned null (e.g. table missing or query failed).
      setStats({
        users: usersRes.count || 0,
        experiences: expRes.count || 0,
        skills: skillsRes.count || 0,
        applications: appsRes.count || 0,
        gigs: gigsData.length,
        totalIncome: income
      })
      
      setLoading(false)
    }

    fetchStats()
  }, [])

  if (loading) {
    return <p className="p-8 text-center text-slate-500 dark:bg-slate-950 dark:text-white min-h-screen">Loading platform stats...</p>
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950 p-8 transition-colors duration-300">
      <div className="mx-auto max-w-4xl">
        
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
            <Icon name="spark" size={14} /> Internal Impact Dashboard
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-slate-950 dark:text-white">Vouch by the Numbers</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Real-time metrics from the Supabase database.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Total Users</p>
            <p className="mt-2 text-4xl font-extrabold text-slate-950 dark:text-white">{stats.users}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Experiences Logged</p>
            <p className="mt-2 text-4xl font-extrabold text-slate-950 dark:text-white">{stats.experiences}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Skills Confirmed</p>
            <p className="mt-2 text-4xl font-extrabold text-slate-950 dark:text-white">{stats.skills}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Gigs Applied For</p>
            <p className="mt-2 text-4xl font-extrabold text-slate-950 dark:text-white">{stats.applications}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Gigs Completed</p>
            <p className="mt-2 text-4xl font-extrabold text-slate-950 dark:text-white">{stats.gigs}</p>
          </div>

          {/* Highlighted Income Card */}
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 p-6 shadow-sm">
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase">Youth Income Logged</p>
            <p className="mt-2 text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
              R{stats.totalIncome.toLocaleString()}
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}