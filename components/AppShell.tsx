'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import HeaderActions from './HeaderActions'

export default function AppLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // 1. If on the public profile page, hide the sidebar/header completely
  if (pathname.startsWith('/p/')) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950">
        {children}
      </main>
    )
  }

  // 2. Otherwise, show the normal app layout (Sidebar + Header + BottomNav)
  return (
    <div className="flex min-h-screen bg-[#f7f9fc] dark:bg-slate-950">
      
      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-5">
          <p className="text-sm font-bold text-slate-500">Your experience counts.</p>
          <HeaderActions />
        </header>
        
        {/* Main Page Content */}
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />
      
    </div>
  )
}