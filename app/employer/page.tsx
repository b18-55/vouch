// 1. IMPORTS
// We import Link from Next.js for fast client-side navigation (no page reloads).
import Link from 'next/link'
// We import our custom UI components (Button, Icon, PageTitle) 
// from the teammate's Figma export so the design stays consistent.
import { Button, Icon, PageTitle } from '@/components/ui'

// 2. MAIN COMPONENT
// This is the default export for the /employer route.
export default function EmployerPage() {
  return (
    // OUTER CONTAINER
    // min-h-screen: Ensures the page takes at least the full height of the browser.
    // bg-[#f7f9fc]: Applies the light blue/grey background color from the Figma design.
    // pb-20: Adds padding at the bottom so content doesn't get cut off by the screen edge.
    <div className="min-h-screen bg-[#f7f9fc] pb-20">
      
      {/* --- TOP NAVIGATION BAR --- */}
      {/* 
        sticky top-0: Keeps the nav bar fixed at the top when scrolling.
        z-20: Ensures the nav bar sits on top of other content (z-index).
        h-16: Fixed height of 64px.
        border-b: Adds a subtle line at the bottom.
        bg-white: White background.
      */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
        <div className="flex items-center gap-2">
          {/* The Vouch Logo (SVG) */}
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
              <path d="m5 6 7 13 7-13h-4l-3 6-3-6H5Z" fill="currentColor" />
              <path d="m8 3 4 7 4-7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-950">Vouch</span>
          {/* Workspace Badge - Tells the user which section of the app they are in */}
          <span className="ml-2 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
            Employer Workspace
          </span>
        </div>

        {/* Link back to the main youth dashboard */}
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-black">
          Back to Youth App
        </Link>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      {/* mx-auto: Centers the content horizontally. max-w-7xl: Prevents it from stretching too wide on large monitors. */}
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        
        {/* ROADMAP BADGE */}
        {/* As per the SRS (Section 6.4), we must label unbuilt features honestly. */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
          🚧 Roadmap: Designed, planned after the hackathon
        </div>

        {/* PAGE TITLE COMPONENT */}
        {/* We pass props (eyebrow, title, text, action) to the reusable PageTitle component */}
        <PageTitle 
          eyebrow="LANGA CORNER STORE" 
          title="Hiring made simpler" 
          text="Find capable young people for short, meaningful work." 
          action={<Button icon="plus">Post an opportunity</Button>} 
        />

        {/* --- DASHBOARD STATS GRID --- */}
        {/* 
          grid: Enables CSS Grid.
          gap-4: Adds spacing between the cards.
          sm:grid-cols-2: 2 columns on small screens (tablets).
          xl:grid-cols-4: 4 columns on extra-large screens (desktops).
        */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Stat Card 1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Open tasks</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">3</p>
          </div>
          {/* Stat Card 2 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">New applicants</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">18</p>
            <p className="mt-1 text-xs font-semibold text-emerald-600">+7 this week</p> {/* Green text for positive growth */}
          </div>
          {/* Stat Card 3 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Shortlisted</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">6</p>
          </div>
          {/* Stat Card 4 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed hires</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-950">24</p>
          </div>
        </div>

        {/* --- MAIN CONTENT GRID (Applicants & Tip) --- */}
        {/* 
          lg:grid-cols-[1.4fr_1fr]: On large screens, split the row. 
          The left side (Applicants) takes 1.4 fractions of space, 
          the right side (Tip) takes 1 fraction. 
        */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          
          {/* LEFT SIDE: RECENT APPLICANTS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            {/* Header with title and "View all" button */}
            <div className="flex justify-between">
              <h2 className="font-extrabold text-slate-950">Recent applicants</h2>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-800">View all</button>
            </div>

            {/* Applicant List */}
            <div className="mt-5 space-y-4">
              
              {/* Applicant 1 */}
              {/* flex items-center: Aligns the avatar, text, and badge horizontally in the middle */}
              <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50">
                {/* Avatar Circle */}
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-xs font-extrabold text-blue-700">TM</span>
                {/* Name & Skills */}
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Thabo Mokoena</p>
                  <p className="text-xs text-slate-400">Customer service · Cash handling</p>
                </div>
                {/* Match Badge */}
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-extrabold text-emerald-700">92% match</span>
              </div>

              {/* Applicant 2 */}
              <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-xs font-extrabold text-blue-700">AN</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Amahle Ndlovu</p>
                  <p className="text-xs text-slate-400">Retail · Communication</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-extrabold text-emerald-700">87% match</span>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE: HIRING TIP CARD */}
          {/* bg-slate-950: Very dark navy background.
              text-white: Makes all text inside white for contrast.
              p-6: Internal padding.
          */}
          <div className="rounded-2xl bg-slate-950 p-6 text-white">
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