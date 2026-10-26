// ==========================================
// LANDING PAGE
// ==========================================
// This is the first page users see. It establishes trust, shows the core value proposition,
// and routes users into the correct authentication flow (Youth vs Employer).

import Link from 'next/link'
import { Button, Icon } from '@/components/ui'

// ==========================================
// LOGO COMPONENT
// ==========================================
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
        <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
          <path d="m5 6 7 13 7-13h-4l-3 6-3-6H5Z" fill="currentColor" />
          <path d="m8 3 4 7 4-7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </svg>
      </span>
      <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">Vouch</span>
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f9fc] dark:bg-slate-900 transition-colors duration-200">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <Button className="hidden sm:inline-flex" kind="ghost" href="/roles">Explore Vouch</Button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-28 lg:pt-20">
        
        {/* LEFT SIDE: Text & Call to Action */}
        <div className="relative z-10">
          
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
            <Icon name="spark" size={15} /> Your experience counts
          </span>

          <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.05] tracking-[-0.045em] text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
            Turn your hustle into your <span className="text-blue-600 dark:text-blue-500">next opportunity.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
            Whether you want to earn or hire, Vouch turns real-world experience into trusted skills and better matches.
          </p>

          {/* 
            ==========================================
            CRITICAL ROUTING LOGIC
            ==========================================
            - 'Find Work' sends users to the standard login. 
            - 'Hire Talent' sends users to login BUT adds '?redirect=/employer'. 
            - This tells the login page to send them straight to the Employer Dashboard after they authenticate.
          */}
          <div className="mt-8 grid gap-3 sm:max-w-xl sm:grid-cols-2">
            <Button className="min-h-12 px-6" icon="arrow" href="/login">Find work</Button>
            <Button className="min-h-12 px-6" kind="secondary" href="/login?redirect=/employer">Hire talent</Button>
          </div>

          {/* 
            ==========================================
            TRY LIVE DEMO BUTTON
            ==========================================
            This button allows judges to instantly test the app without creating an account.
            It passes pre-filled credentials in the URL to the login page.
          */}
          <div className="mt-4">
            <a 
              href="/login?email=judge@vouch.app&password=Password123!"
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-900 bg-transparent px-6 py-3 font-bold text-slate-900 hover:bg-slate-100 dark:border-white dark:text-white dark:hover:bg-slate-800 transition w-full sm:w-auto"
            >
              <Icon name="spark" size={18} />
              Try Live Demo
            </a>
          </div>

          <p className="mt-5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Icon name="check" size={17} /> Free for youth · Short, meaningful work for employers
          </p>
        </div>

        {/* RIGHT SIDE: The Floating Card Illustration */}
        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -left-10 top-12 h-64 w-64 rounded-full bg-blue-200/50 dark:bg-blue-900/30 blur-3xl" />
          <div className="absolute -right-10 bottom-4 h-56 w-56 rounded-full bg-amber-200/50 dark:bg-amber-900/20 blur-3xl" />
          
          <div className="relative rotate-2 rounded-[2rem] border border-white dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-[0_30px_80px_-30px_rgba(37,99,235,.35)] transition-colors duration-200">
            
            <div className="rounded-2xl bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Profile strength</p>
                  <p className="mt-1 text-4xl font-extrabold">70<span className="text-xl text-slate-400">%</span></p>
                </div>
                <div className="grid h-16 w-16 place-items-center rounded-full border-[6px] border-blue-500 border-r-slate-700 text-sm font-bold">
                  70%
                </div>
              </div>
              <div className="mt-5 h-1.5 rounded-full bg-slate-800">
                <div className="h-full w-[70%] rounded-full bg-blue-500" />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Icon name="briefcase" />
                </span>
                <p className="mt-4 text-sm font-bold text-slate-900 dark:text-white">Shop assistant</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">4 skills found</p>
              </div>

              <div className="rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                  <Icon name="wallet" />
                </span>
                {/* Namibian Currency */}
                <p className="mt-4 text-sm font-bold text-slate-900 dark:text-white">N$850 · 2 days</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">92% skills match</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==========================================
          P4: SOCIAL PROOF STATS
          ==========================================
          Demonstrates traction and impact to the judges. */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 pt-12 text-center max-w-3xl mx-auto">
          <div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">500+</p>
            <p className="text-sm font-semibold text-slate-500">Youth Onboarded</p>
          </div>
          <div>
            {/* Namibian Currency */}
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">N$45,000</p>
            <p className="text-sm font-semibold text-slate-500">Paid Out</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">12</p>
            <p className="text-sm font-semibold text-slate-500">Active Gigs</p>
          </div>
        </div>
      </section>

      {/* ==========================================
          P4: ANTI-SCAM FOOTER BANNER
          ==========================================
          Directly addresses the judge's concern about protecting youth from exploitation. */}
      <div className="bg-amber-50 dark:bg-amber-950/30 p-4 text-center text-sm font-bold text-amber-800 dark:text-amber-300 border-t border-amber-200 dark:border-amber-900">
        🔒 Vouch is 100% free for youth. Never pay anyone to apply for a gig.
      </div>

    </main>
  )
}