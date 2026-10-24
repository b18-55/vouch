import Link from 'next/link'
import { Button, Icon, PageTitle } from '@/components/ui'

export default function EmployerPage() {
  return (
    // OUTER CONTAINER: Added dark mode background and text color
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-5 lg:px-8 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
              <path d="m5 6 7 13 7-13h-4l-3 6-3-6H5Z" fill="currentColor" />
              <path d="m8 3 4 7 4-7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </span>
          {/* Added dark:text-white to the logo text */}
          <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">Vouch</span>
          <span className="ml-2 rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            Employer Workspace
          </span>
        </div>

        {/* FIX: Changed href from "/dashboard" to "/roles" to route to the Workspace Chooser */}
        <Link href="/roles" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">
          Back to Youth App
        </Link>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        
        {/* Roadmap Badge: Added dark mode colors */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-400">
          🚧 Roadmap: Designed, planned after the hackathon
        </div>

        <PageTitle 
          eyebrow="LANGA CORNER STORE" 
          title="Hiring made simpler" 
          text="Find capable young people for short, meaningful work." 
          action={<Button icon="plus">Post an opportunity</Button>} 
        />

        {/* --- DASHBOARD STATS GRID --- */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Added dark mode classes to all stat cards */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 transition-colors duration-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Open tasks</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">3</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 transition-colors duration-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">New applicants</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">18</p>
            <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">+7 this week</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 transition-colors duration-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Shortlisted</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">6</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 transition-colors duration-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Completed hires</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">24</p>
          </div>
        </div>

        {/* --- MAIN CONTENT GRID (Applicants & Tip) --- */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          
          {/* LEFT SIDE: RECENT APPLICANTS */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 transition-colors duration-200">
            <div className="flex justify-between">
              <h2 className="font-extrabold text-slate-950 dark:text-white">Recent applicants</h2>
              <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">View all</button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Applicant 1 */}
              <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-xs font-extrabold text-blue-700 dark:text-blue-300">TM</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Thabo Mokoena</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Customer service · Cash handling</p>
                </div>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">92% match</span>
              </div>

              {/* Applicant 2 */}
              <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-xs font-extrabold text-blue-700 dark:text-blue-300">AN</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Amahle Ndlovu</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Retail · Communication</p>
                </div>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">87% match</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: HIRING TIP CARD */}
          <div className="rounded-2xl bg-slate-950 dark:bg-slate-800/80 dark:border dark:border-slate-700 p-6 text-white transition-colors duration-200">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Hiring tip</p>
            <h2 className="mt-3 text-xl font-extrabold">Focus on demonstrated skills, not formal titles.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Vouch profiles translate informal experience into relevant workplace capabilities.
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}