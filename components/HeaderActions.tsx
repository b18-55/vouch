'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon } from '@/components/ui'

export default function HeaderActions() {
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [initials, setInitials] = useState('U')
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const notifications = [
    { id: 1, title: 'New match found!', desc: 'Weekend shop assistant matches your skills.', time: '2m ago', unread: true },
    { id: 2, title: 'Profile verified', desc: 'Your identity has been confirmed.', time: '1h ago', unread: false },
  ]

  // Fetch user initials
  useEffect(() => {
    const getInitials = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
        if (profile?.full_name) {
          const nameParts = profile.full_name.split(' ')
          const initialsString = nameParts.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
          setInitials(initialsString)
        }
      }
    }
    getInitials()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex items-center gap-4 relative" ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setIsNotifOpen(!isNotifOpen)}
          className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
        >
          <Icon name="bell" size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900" />
        </button>

        {isNotifOpen && (
          <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 dark:text-white">Notifications</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${n.unread ? 'bg-blue-500' : 'bg-transparent'}`} />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{n.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{n.desc}</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-1.5">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => router.push('/settings')}
        className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 dark:bg-blue-900/60 text-sm font-extrabold text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
      >
        {initials}
      </button>
    </div>
  )
}