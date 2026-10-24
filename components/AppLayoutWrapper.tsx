'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import HeaderActions from './HeaderActions'
import BottomNav from './BottomNav'

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Define pages that should not display the authenticated sidebar and headers.
  // Added /employer and /admin to this list.
  const isPublicPage = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname === '/employer' || 
    pathname === '/admin'

  if (isPublicPage) {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <div className="flex min-h-screen bg-[#f7f9fc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 dark:border-slate-800 z-40">
        <Sidebar />
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:pl-64 h-screen overflow-hidden">
        
        {/* Global Top Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:block">
            Your experience counts.
          </span>
          <div className="flex items-center gap-4 ml-auto">
            <HeaderActions />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav />
      </div>
      
    </div>
  )
}