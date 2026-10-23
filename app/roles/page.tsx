'use client'
// 'use client' is a Next.js directive. It tells Next.js that this component 
// must run in the browser (Client Component) rather than purely on the server.
// We need this because we use Next.js navigation and client-side rendering.

import Link from 'next/link'
// We import 'Link' from Next.js. 
// We use 'Link' instead of a standard '<a>' tag because it uses client-side 
// navigation. This means the page loads instantly without a full browser refresh.

import { Button, Icon } from '@/components/ui'
// We import shared UI components from your teammate's file.
// Button: A reusable styled button.
// Icon: A reusable SVG icon component.

export default function RolesPage() {
  return (
    // 'min-h-screen' makes the page take up the full height of the browser window.
    // 'bg-[#f7f9fc] dark:bg-slate-900' sets the light blue/grey background for light mode and slate-900 for dark mode.
    <main className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* ==========================================
          TOP NAVIGATION BAR
          ========================================== */}
      {/* 'mx-auto max-w-6xl' centers the nav and keeps it from stretching too wide. */}
      {/* 'flex items-center justify-between' puts the logo on the left, button on the right. */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        
        {/* Logo linking back to the home page */}
        <Link href="/" className="flex items-center gap-2.5">
          {/* The blue square with the V icon */}
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
            {/* Inline SVG for the logo to avoid loading external images */}
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
              <path d="m5 6 7 13 7-13h-4l-3 6-3-6H5Z" fill="currentColor" />
              <path d="m8 3 4 7 4-7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">Vouch</span>
        </Link>

        {/* Button to go back to the landing page */}
        <Button kind="secondary" href="/">Back to website</Button>
      </nav>

      {/* ==========================================
          MAIN CONTENT AREA
          ========================================== */}
      {/* 'pb-16 pt-10' adds padding to the bottom and top of the section. */}
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-10 text-center">
        
        {/* The small blue text above the main title */}
        <p className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          CHOOSE YOUR WORKSPACE
        </p>
        
        {/* The main headline */}
        {/* 'text-4xl sm:text-5xl' means text size 4xl on mobile, 5xl on larger screens. */}
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
          What brings you to Vouch?
        </h1>
        
        {/* Subtitle text */}
        <p className="mx-auto mt-4 max-w-2xl text-slate-500 dark:text-slate-400">
          We’ll take you to the tools that match what you want to do today.
        </p>
        
        {/* ==========================================
            THE CARDS GRID
            ========================================== */}
        {/* 
          'grid gap-4' creates a grid layout with a gap between items.
          'sm:grid-cols-2' means 2 columns on tablet screens.
          'lg:grid-cols-3' means 3 columns on desktop screens.
          On mobile (default), it stacks in 1 column.
        */}
        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          
          {/* --- CARD 1: YOUTH WORKER --- */}
          {/* 
            'group' is a Tailwind class. It allows child elements to react 
            when the parent card is hovered.
            'hover:-translate-y-1' moves the card up by 4px when hovered.
            'hover:shadow-xl' adds a large shadow when hovered.
            'transition' makes the hover effect smooth, not instant.
          */}
          <Link 
            href="/dashboard" 
            className="group min-h-56 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-xl"
          >
            {/* The icon container */}
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">
              <Icon name="profile" size={22} />
            </span>
            
            {/* Card Title */}
            <h2 className="mt-5 text-lg font-extrabold text-slate-950 dark:text-white">
              Youth worker
            </h2>
            
            {/* Card Description */}
            <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">
              Build a skills profile and find paid opportunities.
            </p>
            
            {/* The "Continue" link inside the card */}
            <span className="mt-5 flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400">
              Continue <Icon name="arrow" size={16} />
            </span>
          </Link>

          {/* --- CARD 2: EMPLOYER --- */}
          <Link 
            href="/employer" 
            className="group min-h-56 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-xl"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400">
              <Icon name="briefcase" size={22} />
            </span>
            
            <h2 className="mt-5 text-lg font-extrabold text-slate-950 dark:text-white">
              Employer
            </h2>
            
            <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">
              Post short-term work and hire work-ready youth.
            </p>
            
            <span className="mt-5 flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400">
              Continue <Icon name="arrow" size={16} />
            </span>
          </Link>

          {/* --- CARD 3: ADMIN --- */}
          <Link 
            href="/admin" 
            className="group min-h-56 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-xl"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              <Icon name="settings" size={22} />
            </span>
            
            <h2 className="mt-5 text-lg font-extrabold text-slate-950 dark:text-white">
              Platform admin
            </h2>
            
            <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">
              Protect quality, safety and platform operations.
            </p>
            
            <span className="mt-5 flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400">
              Continue <Icon name="arrow" size={16} />
            </span>
          </Link>
          
        </div>
      </section>
    </main>
  )
}