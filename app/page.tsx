import Link from 'next/link'
import { Button, Icon } from '@/components/ui'

// ==========================================
// 1. LOGO COMPONENT
// ==========================================
// We extract the logo into its own small component so the code is cleaner 
// if we ever want to reuse it elsewhere.
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
        <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
          <path d="m5 6 7 13 7-13h-4l-3 6-3-6H5Z" fill="currentColor" />
          <path d="m8 3 4 7 4-7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </svg>
      </span>
      <span className="text-xl font-extrabold tracking-tight text-slate-950">Vouch</span>
    </div>
  )
}

// ==========================================
// 2. MAIN LANDING PAGE
// ==========================================
export default function Home() {
  return (
    // 'min-h-screen' ensures the page takes up the full height of the browser window
    // 'bg-[#f7f9fc]' is the light blue/grey background color from your teammate's design
    <main className="min-h-screen overflow-hidden bg-[#f7f9fc]">
      
      {/* --- TOP NAVIGATION BAR --- */}
      {/* max-w-7xl keeps the content centered and prevents it from stretching too wide on large screens */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Logo />
        
        <div className="flex items-center gap-2">
          {/* We use our custom Button component from ui.tsx and pass 'href' to make it a Next.js Link */}
          <Button className="hidden sm:inline-flex" kind="ghost" href="/login">Explore Vouch</Button>
          <Button kind="ghost" href="/login">Log in</Button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      {/* 
        'grid lg:grid-cols-[1.05fr_.95fr]' is a CSS Grid trick. 
        On desktop, it splits the screen into two columns. The left column takes 1.05 fractions of space, 
        the right takes 0.95 (so the text side is slightly wider).
        On mobile, it stacks vertically.
      */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-28 lg:pt-20">
        
        {/* ==========================================
            LEFT SIDE: Text & Call to Action
            ========================================== */}
        <div className="relative z-10">
          
          {/* Small pill badge at the top */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            <Icon name="spark" size={15} />
            Your experience counts
          </span>

          {/* Main Headline */}
          {/* 'leading-[1.05]' tightens the line height for a modern, punchy look */}
          <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
            Turn your hustle into your <span className="text-blue-600">next opportunity.</span>
          </h1>

          {/* Sub-headline */}
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Whether you want to earn or hire, Vouch turns real-world experience into trusted skills and better matches.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 grid gap-3 sm:max-w-xl sm:grid-cols-2">
            <Button className="min-h-12 px-6" icon="arrow" href="/signup">Find work</Button>
            <Button className="min-h-12 px-6" kind="secondary" href="/signup">Hire talent</Button>
          </div>

          {/* Trust badge below buttons */}
          <p className="mt-5 flex items-center gap-2 text-sm text-slate-500">
            <Icon name="check" size={17} />
            Free for youth · Short, meaningful work for employers
          </p>
        </div>

        {/* ==========================================
            RIGHT SIDE: The Floating Card Illustration
            ========================================== */}
        <div className="relative mx-auto w-full max-w-lg">
          
          {/* Decorative background blurs behind the card */}
          <div className="absolute -left-10 top-12 h-64 w-64 rounded-full bg-blue-200/50 blur-3xl" />
          <div className="absolute -right-10 bottom-4 h-56 w-56 rounded-full bg-amber-200/50 blur-3xl" />
          
          {/* The main card container. 
              'rotate-2' tilts it slightly. 
              'shadow-[...]' adds a heavy, soft drop shadow. */}
          <div className="relative rotate-2 rounded-[2rem] border border-white bg-white p-5 shadow-[0_30px_80px_-30px_rgba(37,99,235,.35)]">
            
            {/* Dark "Profile Strength" widget inside the card */}
            <div className="rounded-2xl bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Profile strength</p>
                  <p className="mt-1 text-4xl font-extrabold">70<span className="text-xl text-slate-400">%</span></p>
                </div>
                {/* Circular progress ring using border tricks */}
                <div className="grid h-16 w-16 place-items-center rounded-full border-[6px] border-blue-500 border-r-slate-700 text-sm font-bold">
                  70%
                </div>
              </div>
              {/* Horizontal progress bar */}
              <div className="mt-5 h-1.5 rounded-full bg-slate-800">
                <div className="h-full w-[70%] rounded-full bg-blue-500" />
              </div>
            </div>

            {/* Two small job/skill cards below the dark widget */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              
              {/* Card 1: Skill found */}
              <div className="rounded-2xl border border-slate-100 p-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon name="briefcase" />
                </span>
                <p className="mt-4 text-sm font-bold text-slate-900">Shop assistant</p>
                <p className="mt-1 text-xs text-slate-500">4 skills found</p>
              </div>

              {/* Card 2: Job match */}
              <div className="rounded-2xl border border-slate-100 p-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
                  <Icon name="wallet" />
                </span>
                <p className="mt-4 text-sm font-bold text-slate-900">R850 · 2 days</p>
                <p className="mt-1 text-xs text-slate-500">92% skills match</p>
              </div>

            </div>

          </div>
        </div>

      </section>
    </main>
  )
}