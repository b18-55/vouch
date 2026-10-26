'use client'
// Client component: Uses usePathname to detect the current URL and conditionally render the layout.

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import HeaderActions from './HeaderActions'
import BottomNav from './BottomNav'
import FakeToast from '@/components/FakeToast' // P4: Import the FakeToast

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  // This hook grabs the current URL path (e.g., "/dashboard" or "/signup")
  const pathname = usePathname()

  // ==========================================
  // 1. DEFINE PUBLIC PAGES (No Sidebar/Header)
  // ==========================================
  const isPublicPage = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/roles' ||  
    pathname === '/employer' || 
    pathname === '/admin' ||
    pathname === '/stats' || 
    pathname.startsWith('/p/') 

  // ==========================================
  // 2. RENDER PUBLIC LAYOUT (Clean & Full Screen)
  // ==========================================
  if (isPublicPage) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950">
        {children}
        <FakeToast message="Welcome to Vouch! 🚀" />
      </main>
    )
  }

  // ==========================================
  // 3. RENDER AUTHENTICATED LAYOUT (Dashboard, Profile, etc.)
  // ==========================================
  return (
    <div className="flex min-h-screen bg-[#f7f9fc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 dark:border-slate-800 z-40">
        <Sidebar />
      </div>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col md:pl-64 h-screen overflow-hidden">
        
        {/* --- GLOBAL TOP HEADER --- */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:block">
            Your experience counts.
          </span>
          <div className="flex items-center gap-4 ml-auto">
            <HeaderActions />
          </div>
        </header>

        {/* --- PAGE CONTENT --- */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>
      
      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav />
      </div>

      {/* P4: Fake Toast Notification */}
      <FakeToast message="Welcome to Vouch! 🚀" />
      
    </div>
  )
}