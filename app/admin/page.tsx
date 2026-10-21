// Import Next.js Link for navigation and shared UI components
import Link from 'next/link'
import { Button, Icon, PageTitle } from '@/components/ui'

export default function AdminPage() {
  return (
    // OUTER CONTAINER: Full height, light grey background
    <div className="min-h-screen bg-[#f7f9fc] pb-20">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
        <div className="flex items-center gap-2">
          {/* Admin Logo uses a dark slate color to differentiate from the youth app */}
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22"><path d="m5 6 7 13 7-13h-4l-3 6-3-6H5Z" fill="currentColor" /></svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-950">Vouch</span>
          <span className="ml-2 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">Platform Admin</span>
        </div>
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-black">
          Back to Youth App
        </Link>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        
        {/* ROADMAP BADGE */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
          🚧 Roadmap: Designed, planned after the hackathon
        </div>

        {/* PAGE TITLE */}
        <PageTitle 
          eyebrow="PLATFORM OPERATIONS" 
          title="Good morning, Naledi" 
          text="Here’s what needs your attention today." 
        />

        {/* --- STATS GRID --- */}
        {/* grid: 1 col on mobile, 2 on tablet (sm), 4 on desktop (xl) */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active users</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">2,481</p>
            {/* Emerald green text for positive growth */}
            <p className="mt-1 text-xs font-semibold text-emerald-600">+8.2% this month</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Open tasks</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">86</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending reviews</p>
            {/* Amber text to indicate a warning/action needed */}
            <p className="mt-2 text-3xl font-extrabold text-amber-600">12</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Reports</p>
            {/* Red text to indicate critical action needed */}
            <p className="mt-2 text-3xl font-extrabold text-red-600">3</p>
          </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        {/* lg:grid-cols-2 splits the row into two equal halves on desktop */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          
          {/* LEFT SIDE: Review Queue */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex justify-between">
              <h2 className="font-extrabold text-slate-950">Review queue</h2>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-800">Open queue</button>
            </div>
            <div className="mt-5 space-y-3">
              
              {/* Review Item 1 */}
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                {/* Red dot indicates High Priority */}
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Employer verification</p>
                  <p className="text-xs text-slate-400">Langa Corner Store</p>
                </div>
                <Icon name="chevron" size={16} />
              </div> {/* <--- THIS WAS MISSING */}

              {/* Review Item 2 */}
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Reported opportunity</p>
                  <p className="text-xs text-slate-400">Brand ambassador role</p>
                </div>
                <Icon name="chevron" size={16} />
              </div>

            </div>
          </div>
          
          {/* RIGHT SIDE: Platform Activity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-extrabold text-slate-950">Platform activity</h2>
            <div className="mt-5 space-y-5">
              {/* Activity Item 1 */}
              <div className="flex gap-3">
                {/* Blue dot indicates a neutral/informational activity */}
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-bold text-slate-900">24 new youth profiles</p>
                  <p className="text-xs text-slate-400">In the last 24 hours</p>
                </div>
              </div>
              {/* Activity Item 2 */}
              <div className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-bold text-slate-900">8 opportunities published</p>
                  <p className="text-xs text-slate-400">Across 6 employers</p>
                </div>
              </div>
              {/* Activity Item 3 */}
              <div className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-bold text-slate-900">17 placements completed</p>
                  <p className="text-xs text-slate-400">R21,400 total youth earnings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}