import Link from 'next/link'
import { Button, Icon, PageTitle } from '@/components/ui'

export default function AdminPage() {
  return (
    // OUTER CONTAINER: Added dark mode background and text color
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-5 lg:px-8 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22"><path d="m5 6 7 13 7-13h-4l-3 6-3-6H5Z" fill="currentColor" /></svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">Vouch</span>
          <span className="ml-2 rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">Platform Admin</span>
        </div>
        {/* FIX: Changed href from "/dashboard" to "/roles" */}
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
          eyebrow="PLATFORM OPERATIONS" 
          title="Good morning, Naledi" 
          text="Here’s what needs your attention today." 
        />

        {/* --- STATS GRID --- */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Added dark mode classes to all stat cards */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 transition-colors duration-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Active users</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">2,481</p>
            <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">+8.2% this month</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 transition-colors duration-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Open tasks</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">86</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 transition-colors duration-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pending reviews</p>
            <p className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">12</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 transition-colors duration-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Reports</p>
            <p className="mt-2 text-3xl font-extrabold text-red-600 dark:text-red-400">3</p>
          </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          
          {/* LEFT SIDE: Review Queue */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 transition-colors duration-200">
            <div className="flex justify-between">
              <h2 className="font-extrabold text-slate-950 dark:text-white">Review queue</h2>
              <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">Open queue</button>
            </div>
            <div className="mt-5 space-y-3">
              
              {/* Review Item 1 */}
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3 transition-colors">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Employer verification</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Langa Corner Store</p>
                </div>
                <span className="text-slate-400 dark:text-slate-500"><Icon name="chevron" size={16} /></span>
              </div>

              {/* Review Item 2 */}
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 p-3 transition-colors">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Reported opportunity</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Brand ambassador role</p>
                </div>
                <span className="text-slate-400 dark:text-slate-500"><Icon name="chevron" size={16} /></span>
              </div>

            </div>
          </div>
          
          {/* RIGHT SIDE: Platform Activity */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 transition-colors duration-200">
            <h2 className="font-extrabold text-slate-950 dark:text-white">Platform activity</h2>
            <div className="mt-5 space-y-5">
              {/* Activity Item 1 */}
              <div className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">24 new youth profiles</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">In the last 24 hours</p>
                </div>
              </div>
              {/* Activity Item 2 */}
              <div className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">8 opportunities published</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Across 6 employers</p>
                </div>
              </div>
              {/* Activity Item 3 */}
              <div className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">17 placements completed</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">R21,400 total youth earnings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}