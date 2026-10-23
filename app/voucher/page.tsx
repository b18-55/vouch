import Link from 'next/link'
import { Button, Icon } from '@/components/ui'

export default function VoucherPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-20">
      
      {/* TOP NAVIGATION */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
        <div className="flex items-center gap-2">
          {/* Emerald logo to differentiate the Voucher role */}
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white">
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22"><path d="m5 6 7 13 7-13h-4l-3 6-3-6H5Z" fill="currentColor" /></svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-950">Vouch</span>
          <span className="ml-2 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Voucher Workspace</span>
        </div>
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-black">Back to Youth App</Link>
      </header>

      {/* 
        MAIN CONTENT: max-w-2xl makes this page much narrower than the Admin page. 
        This is a single-task form, so we want the user to focus on one thing.
      */}
      <main className="mx-auto max-w-2xl px-5 py-8">
        
        {/* ROADMAP BADGE */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
          🚧 Roadmap: Designed, planned after the hackathon
        </div>

        {/* HEADER TEXT: text-center centers the icon, title, and subtitle */}
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Icon name="check" size={26} />
          </span>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-widest text-emerald-700">VOUCH REQUEST</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Can you confirm Thabo’s experience?</h1>
          <p className="mt-3 text-sm text-slate-500">This takes about 2 minutes. Your response helps employers trust informal work.</p>
        </div>

        {/* FORM CARD */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          
          {/* PROFILE SUMMARY */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-100 text-xs font-extrabold text-blue-700">TM</span>
            <div>
              <p className="font-extrabold text-slate-900">Thabo Mokoena</p>
              <p className="text-xs text-slate-400">Shop assistant · September 2026</p>
            </div>
          </div>
          
          {/* EXPERIENCE QUOTE */}
          <p className="mt-5 text-sm leading-6 text-slate-600">
            “Helped customers find products, managed the till and counted stock at the end of each day.”
          </p>
          
          {/* FORM QUESTIONS */}
          <div className="mt-6 space-y-5">
            
            {/* Question 1: Yes/No Grid */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Did you see Thabo do this work?</span>
              {/* grid-cols-2 splits the two buttons evenly */}
              <span className="grid grid-cols-2 gap-3">
                {/* Active state: Emerald border and background */}
                <button className="rounded-xl border-2 border-emerald-600 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Yes, I did</button>
                {/* Inactive state: Grey border */}
                <button className="rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-600 hover:bg-slate-50">I’m not sure</button>
              </span>
            </label>
            
            {/* Question 2: Skills Tags */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Which skills did you observe?</span>
              {/* flex-wrap ensures the tags move to the next line if there is no space */}
              <span className="flex flex-wrap gap-2">
                {["Customer service", "Cash handling", "Stock management"].map((s) => (
                  <button className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700" key={s}>
                    <Icon name="check" size={13} />
                  </button>
                ))}
              </span>
            </label>
            
            {/* Submit Button */}
            <Button className="w-full">Submit my vouch</Button>
          </div>
        </div>
      </main>
    </div>
  )
}