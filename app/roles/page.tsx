'use client'
// 'use client' is a Next.js directive. It tells Next.js that this component 
// must run in the browser (Client Component) rather than purely on the server.
// We need this because we use Next.js navigation and client-side rendering.

import Link from 'next/link'
import { Button, Icon } from '@/components/ui'

export default function RolesPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
              <path d="m5 6 7 13 7-13h-4l-3 6-3-6H5Z" fill="currentColor" />
              <path d="m8 3 4 7 4-7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">Vouch</span>
        </Link>
        <Button kind="secondary" href="/">Back to website</Button>
      </nav>

      <section className="mx-auto max-w-5xl px-5 pb-16 pt-10 text-center">
        <p className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          CHOOSE YOUR WORKSPACE
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
          What brings you to Vouch?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-500 dark:text-slate-400">
          We’ll take you to the tools that match what you want to do today.
        </p>
        
        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          
          {/* 
            ==========================================
            CARD 1: YOUTH WORKER
            ==========================================
            Explicitly passes ?redirect=/dashboard so the login page knows 
            to send them to the youth side after they authenticate.
          */}
          <Link 
            href="/login?redirect=/dashboard" 
            className="group min-h-56 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-xl"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">
              <Icon name="profile" size={22} />
            </span>
            <h2 className="mt-5 text-lg font-extrabold text-slate-950 dark:text-white">
              Youth worker
            </h2>
            <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">
              Build a skills profile and find paid opportunities.
            </p>
            <span className="mt-5 flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400">
              Continue <Icon name="arrow" size={16} />
            </span>
          </Link>

          {/* 
            ==========================================
            CARD 2: EMPLOYER
            ==========================================
            Explicitly passes ?redirect=/employer so the login page knows 
            to send them to the employer dashboard after they authenticate.
          */}
          <Link 
            href="/login?redirect=/employer" 
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

          {/* CARD 3: ADMIN */}
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