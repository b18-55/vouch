'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Icon } from './ui'

/**
 * EarningsSummary Component
 * 
 * Architecture & Purpose:
 * This is a client-side widget designed for the Youth Dashboard. It connects directly 
 * to the `gigs` table in Supabase to calculate and display the user's total income.
 * 
 * Localization:
 * It dynamically fetches the user's location to display the correct currency symbol.
 * Since the Namibian Dollar (N$) and South African Rand (R) are pegged 1:1, 
 * we use the same numeric value but adapt the UI symbol based on geography.
 */
export default function EarningsSummary() {
  const [totalEarned, setTotalEarned] = useState<number>(0)
  const [gigCount, setGigCount] = useState<number>(0)
  const [currency, setCurrency] = useState<string>('R')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setLoading(false)
          return
        }

        // Fetch user location and gigs simultaneously
        const [profileRes, gigsRes] = await Promise.all([
          supabase.from('profiles').select('location').eq('id', session.user.id).single(),
          supabase.from('gigs').select('amount_zar').eq('user_id', session.user.id)
        ])

        // Determine Currency Symbol (Default to ZAR if location is not Namibia)
        if (profileRes.data?.location) {
          const isNamibia = profileRes.data.location.toLowerCase().includes('namibia')
          setCurrency(isNamibia ? 'N$' : 'R')
        }

        if (gigsRes.data) {
          const sum = gigsRes.data.reduce((acc, gig) => acc + (gig.amount_zar || 0), 0)
          setTotalEarned(sum)
          setGigCount(gigsRes.data.length)
        }
      } catch (err) {
        console.error('Error fetching earnings:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadEarnings()
  }, [])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 animate-pulse">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="h-8 w-32 bg-slate-300 dark:bg-slate-600 rounded mb-2" />
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 transition-colors duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Total Earned</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">From completed gigs</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
          <Icon name="briefcase" />
        </span>
      </div>
      
      <p className="mt-5 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
        {currency}{totalEarned.toLocaleString('en-ZA')}
      </p>
      
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        From {gigCount} completed {gigCount === 1 ? 'gig' : 'gigs'}
      </p>
    </div>
  )
}