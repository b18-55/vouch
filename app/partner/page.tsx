import Link from 'next/link'
import { Button, Icon, PageTitle } from '@/components/ui'

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-20">
      
      {/* TOP NAVIGATION */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
        <div className="flex items-center gap-2">
          {/* Amber logo for NGO partner role */}
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-600 text-white">
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22"><path d="m5 6 7 13 7-13h-4l-3 6-3-6H5Z" fill="currentColor" /></svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-950">Vouch</span>
          <span className="ml-2 rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">NGO Partner</span>
        </div>
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-black">Back to Youth App</Link>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* ROADMAP BADGE */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
          🚧 Roadmap: Designed, planned after the hackathon
        </div>

        {/* PAGE TITLE */}
        <PageTitle 
          eyebrow="IKAMVA YOUTH" 
          title="Cohort overview" 
          text="Track participation and work outcomes across your programmes." 
          action={<Button>View cohorts</Button>} 
        />

        {/* --- STATS GRID --- */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active youth</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">248</p>
            <p className="mt-1 text-xs font-semibold text-emerald-600">+18 this month</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Profiles ready</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">74%</p>
            <p className="mt-1 text-xs font-semibold text-emerald-600">+6% this month</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Placements</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">63</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">25% placement rate</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Income unlocked</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">R84k</p>
          </div>
        </div>

        {/* --- CHARTS GRID --- */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          
          {/* LEFT SIDE: Bar Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-extrabold text-slate-950">Participant progress</h2>
            
            {/* 
              h-48: Fixed height for the chart area.
              items-end: Aligns the bars to the bottom.
              border-b: Creates the "floor" of the chart.
            */}
            <div className="mt-6 flex h-48 items-end justify-around gap-3 border-b border-slate-200 px-3">
              {[45, 62, 58, 76, 71, 88].map((h, i) => (
                <div className="flex flex-1 flex-col items-center gap-2" key={h}>
                  {/* 
                    Inline style={{ height: `${h}%` }} allows us to dynamically set 
                    the height of each bar based on the mock data array.
                  */}
                  <div className="w-full max-w-10 rounded-t-lg bg-blue-500" style={{ height: `${h}%` }} />
                  <span className="text-[10px] text-slate-400">{["May", "Jun", "Jul", "Aug", "Sep", "Oct"][i]}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* RIGHT SIDE: Progress Bars */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-extrabold text-slate-950">Top skills unlocked</h2>
            <div className="mt-5 space-y-4">
              {[["Customer service", "72%"], ["Communication", "65%"], ["Teamwork", "54%"], ["Digital literacy", "41%"]].map((s) => (
                <div key={s[0]}>
                  {/* Text label and percentage */}
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">{s[0]}</span>
                    <span className="text-slate-400">{s[1]}</span>
                  </div>
                  {/* Progress Bar Background */}
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                    {/* 
                      Inline style={{ width: s[1] }} dynamically sets the width 
                      of the blue bar based on the percentage string (e.g., "72%").
                    */}
                    <div className="h-full rounded-full bg-blue-500" style={{ width: s[1] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}