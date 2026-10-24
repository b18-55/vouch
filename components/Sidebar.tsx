'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon } from '@/components/ui'

export default function Sidebar() {
  const pathname = usePathname()
  const [strength, setStrength] = useState(0)

  useEffect(() => {
    const fetchStrength = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile } = await supabase.from('profiles').select('full_name, location, bio').eq('id', session.user.id).single()
      const { count: skillsCount } = await supabase.from('skills').select('*', { count: 'exact', head: true }).eq('profile_id', session.user.id)
      const { count: expCount } = await supabase.from('experiences').select('*', { count: 'exact', head: true }).eq('profile_id', session.user.id)

      let score = 0
      if (profile?.full_name && profile?.location) score += 30
      if (profile?.bio) score += 20
      if (skillsCount && skillsCount > 0) score += 25
      if (expCount && expCount > 0) score += 25
      setStrength(score)
    }
    fetchStrength()
  }, [pathname])

  const links = [
    { name: 'Home', href: '/dashboard', icon: 'home' },
    { name: 'My hustle', href: '/hustle', icon: 'spark' },
    { name: 'Opportunities', href: '/tasks', icon: 'briefcase' },
    { name: 'Applications', href: '/applications', icon: 'check' },
    { name: 'My profile', href: '/profile', icon: 'profile' },
  ] as const

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 px-4 py-6">
      
      {/* USING YOUR EXACT LOGO FILE */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <img src="/icon.svg" alt="Vouch Logo" className="h-9 w-9 rounded-[12px]" />
        <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Vouch</span>
      </div>

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

      <div className="mt-auto rounded-2xl bg-slate-900 p-4 text-white dark:bg-slate-950 shadow-sm">
        <p className="text-xs font-bold">Profile strength</p>
        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-700">
          <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${strength}%` }} />
        </div>
        <div className="mt-2 flex justify-between items-center text-xs font-bold">
          <span>{strength}%</span>
          <Link href="/profile" className="text-blue-400 hover:text-blue-300">Complete profile &rarr;</Link>
        </div>
      </div>
    </div>
  )
}