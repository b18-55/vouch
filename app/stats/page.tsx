'use client'
// Client component: uses React hooks (useEffect, useState) to fetch data from Supabase.

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Icon } from '@/components/ui'

/**
 * StatsPage (Internal Impact Dashboard)
 * Hidden page (/stats) designed to show judges live database metrics during the pitch.
 * This proves the app is processing real data, not just mock data.
 */
export default function StatsPage() {
  
  // State holds all the aggregated numbers
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
      
      // We use Promise.all to fire off all these queries to Supabase simultaneously.
      // This is much faster than waiting for one query to finish, then starting the next.
      const [
        usersRes, 
        expRes, 
        skillsRes, 
        appsRes, 
        gigsRes
      ] = await Promise.all([
        
        // The `{ count: 'exact', head: true }` flag is a Supabase optimization.
        // It tells the database to only return the COUNT of the rows, 
        // and to not send any actual row data over the network. This is incredibly fast.
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('experiences').select('*', { count: 'exact', head: true }),
        supabase.from('skills').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        
        // For gigs, we actually need the data (amount_zar) to calculate the total sum.
        supabase.from('gigs').select('amount_zar') 
      ])

      // Safely calculate total income. Defaults to [] if the gigs table is missing.
      const gigsData = gigsRes.data || []
      
      // Reduce() loops through the gigs and sums up the amount_zar column.
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

  // ==========================================
  // SKELETON LOADER
  // ==========================================
  // We use a skeleton that perfectly matches the layout of the real cards.
  // This prevents "layout shift" (the screen jumping) when the data arrives.
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950 p-8 transition-colors duration-300 animate-pulse">
        <div className="mx-auto max-w-4xl">
          
          {/* Skeleton Header */}
          <div className="mb-8 flex flex-col items-center">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="mt-4 h-10 w-64 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="mt-2 h-4 w-80 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>

          {/* Skeleton Grid */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* Generate 6 skeleton cards */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                {/* Skeleton Label */}
                <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                {/* Skeleton Number */}
                <div className="mt-4 h-10 w-16 bg-slate-300 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
          
        </div>
      </div>
    )
  }

  // ==========================================
  // MAIN UI
  // ==========================================
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