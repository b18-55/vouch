'use client'
// 'use client' is required because we use React hooks (usePathname) 
// and interact with the browser's current URL.

import Link from 'next/link'
// Next.js's special navigation component. It loads pages instantly without a full reload.

import { usePathname } from 'next/navigation'
// This hook lets us read the current URL path (e.g., /dashboard or /tasks).

import { Icon } from './ui'
//import the Icon component from your teammate's ui.tsx file.

// ==========================================
// 1. NAVIGATION ITEMS ARRAY
// ==========================================
// This array holds all the links we want to display in the bottom bar.
// 'as const' tells TypeScript to treat these strings as exact literal types, 
// which makes the Icon component happy.
const navItems = [
  { name: 'Home', href: '/dashboard', icon: 'home' as const },
  { name: 'Hustle', href: '/hustle', icon: 'spark' as const },
  { name: 'Jobs', href: '/tasks', icon: 'briefcase' as const },
  { name: 'Applied', href: '/applications', icon: 'check' as const },
  { name: 'Profile', href: '/profile', icon: 'profile' as const },
]

export default function BottomNav() {
  // usePathname() returns the current URL string. 
  // For example, if you are on the dashboard, pathname will be "/dashboard".
  const pathname = usePathname()

  return (
    // ==========================================
    // 2. THE NAVIGATION BAR CONTAINER
    // ==========================================
    // 'fixed inset-x-0 bottom-0': Pins the bar to the bottom of the screen.
    // 'z-50': Ensures it stays on top of all other content.
    // 'lg:hidden': Hides the bar on desktop screens (since we only want it on mobile).
    // 'bg-white/95 backdrop-blur': Gives it a clean, slightly transparent white background.
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[4.75rem] items-center justify-around border-t border-slate-200 bg-white/95 px-1 pb-safe backdrop-blur lg:hidden">
      
      {/* 3. LOOP THROUGH EACH ITEM */}
      {navItems.map((item) => {
        
        // Check if the current page matches the item's href.
        // If they match, we want to highlight the icon in blue.
        const isActive = pathname === item.href

        return (
          <Link
            key={item.name}
            href={item.href}
            // If 'isActive' is true, the text is blue. Otherwise, it's grey.
            className={`flex min-w-[4rem] flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${
              isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {/* Render the icon */}
            <Icon name={item.icon} size={22} />
            {/* Render the text label (e.g., "Home") */}
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}