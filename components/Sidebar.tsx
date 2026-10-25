'use client'
// Client component: needs React hooks (useState, useEffect) to fetch user data 
// and usePathname to highlight the active navigation link.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon } from '@/components/ui'

export default function Sidebar() {
  const pathname = usePathname()
  
  // Holds the calculated profile strength percentage (0-100)
  const [strength, setStrength] = useState(0)

  // ==========================================
  // CALCULATE DYNAMIC PROFILE STRENGTH
  // ==========================================
  useEffect(() => {
    const fetchStrength = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // We use Promise.all to run all 3 queries in parallel (much faster).
      // We only use { count: 'exact', head: true } for skills/experiences 
      // because we just need the number, not the actual data rows.
      const [profileRes, skillsRes, expRes] = await Promise.all([
        supabase.from('profiles').select('full_name, location, bio').eq('id', session.user.id).single(),
        supabase.from('skills').select('*', { count: 'exact', head: true }).eq('profile_id', session.user.id),
        supabase.from('experiences').select('*', { count: 'exact', head: true }).eq('profile_id', session.user.id)
      ])

      const profile = profileRes.data
      const skillsCount = skillsRes.count || 0
      const expCount = expRes.count || 0

      // Math logic matching the Profile page:
      // 30% for basic details + 20% for bio + 25% for skills + 25% for experience
      let score = 0
      if (profile?.full_name && profile?.location) score += 30
      if (profile?.bio) score += 20
      if (skillsCount > 0) score += 25
      if (expCount > 0) score += 25
      
      setStrength(score)
    }
    
    // We add pathname as a dependency so the score recalculates every time 
    // the user clicks a new page (e.g., after they add a skill).
    fetchStrength()
  }, [pathname])

  // Navigation links array
  const links = [
    { name: 'Home', href: '/dashboard', icon: 'home' },
    { name: 'My hustle', href: '/hustle', icon: 'spark' },
    { name: 'Opportunities', href: '/tasks', icon: 'briefcase' },
    { name: 'Applications', href: '/applications', icon: 'check' },
    { name: 'My profile', href: '/profile', icon: 'profile' },
  ] as const

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 px-4 py-6">
      
      {/* LOGO */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <img src="/icon.svg" alt="Vouch Logo" className="h-9 w-9 rounded-[12px]" />
        <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Vouch</span>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon name={link.icon} size={20} />
              {link.name}
            </Link>
          )
        })}
      </nav>

      {/* PROFILE STRENGTH WIDGET */}
      <div className="mt-auto rounded-2xl bg-slate-900 p-4 text-white dark:bg-slate-950 shadow-sm">
        <p className="text-xs font-bold">Profile strength</p>
        
        {/* Progress Bar */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-700">
          <div 
            className="h-full rounded-full bg-blue-500 transition-all duration-500" 
            style={{ width: `${strength}%` }} 
          />
        </div>
        
        {/* Percentage and Link */}
        <div className="mt-2 flex justify-between items-center text-xs font-bold">
          <span>{strength}%</span>
          <Link href="/profile" className="text-blue-400 hover:text-blue-300">
            Complete profile &rarr;
          </Link>
        </div>
      </div>

    </div>
  )
}