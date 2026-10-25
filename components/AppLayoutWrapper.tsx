'use client'
// Client component: Uses usePathname to detect the current URL and conditionally render the layout.

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import HeaderActions from './HeaderActions'
import BottomNav from './BottomNav'

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  // This hook grabs the current URL path (e.g., "/dashboard" or "/signup")
  const pathname = usePathname()

  // ==========================================
  // 1. DEFINE PUBLIC PAGES (No Sidebar/Header)
  // ==========================================
  // We check if the current URL matches any of these.
  const isPublicPage = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/signup' || // THE FIX: Changed from '/register' to '/signup'
    pathname === '/roles' ||  // THE FIX: Added the Workspace Chooser page
    pathname === '/employer' || 
    pathname === '/admin' ||
    pathname === '/stats' || 
    pathname.startsWith('/p/') // <--- Public Profile Pages (e.g., /p/hazel-123)

  // ==========================================
  // 2. RENDER PUBLIC LAYOUT (Clean & Full Screen)
  // ==========================================
  // If the URL is a public page, we skip the sidebar entirely 
  // and just render the page content on a clean background.
  if (isPublicPage) {
    return <main className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950">{children}</main>
  }

  // ==========================================
  // 3. RENDER AUTHENTICATED LAYOUT (Dashboard, Profile, etc.)
  // ==========================================
  return (
    <div className="flex min-h-screen bg-[#f7f9fc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* --- DESKTOP SIDEBAR --- */}
      {/* Hidden on mobile (hidden md:flex), fixed to the left side */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 dark:border-slate-800 z-40">
        <Sidebar />
      </div>

      {/* --- MAIN CONTENT WRAPPER --- */}
      {/* Pushed to the right by 64 units to make room for the sidebar (md:pl-64) */}
      <div className="flex-1 flex flex-col md:pl-64 h-screen overflow-hidden">
        
        {/* --- GLOBAL TOP HEADER --- */}
        {/* Sticky to the top, contains the notification bell and profile avatar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:block">
            Your experience counts.
          </span>
          <div className="flex items-center gap-4 ml-auto">
            <HeaderActions />
          </div>
        </header>

        {/* --- PAGE CONTENT --- */}
        {/* This is where your actual pages (Dashboard, Profile, Tasks) render */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>
      
      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      {/* Only shows on phones (md:hidden), fixed to the bottom */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav />
      </div>
      
    </div>
  )
}