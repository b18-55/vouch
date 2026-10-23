'use client'
// 'use client' is a Next.js directive. It tells Next.js that this component 
// must run in the browser (Client Component) because it uses React hooks 
// (useState, useEffect) and reads the user's session.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Icon, PageTitle } from '@/components/ui'

// ==========================================
// 1. TYPESCRIPT TYPES
// ==========================================
// This defines the exact shape of the job data we expect from Supabase.
type Task = {
  id: string
  title: string
  description: string
  pay_amount: number
  duration_days: number
  employer_name: string
  location: string | null
}

export default function TasksPage() {
  
  // --- STATE ---
  // 'tasks' holds the array of jobs we fetch from the database. Starts empty.
  const [tasks, setTasks] = useState<Task[]>([])
  
  // 'loading' starts as true. This shows the Skeleton Loader. 
  // It MUST be set to false after the fetch, otherwise the skeleton spins forever.
  const [loading, setLoading] = useState(true)
  
  // 'searchQuery' holds the text the user types to filter the jobs.
  const [searchQuery, setSearchQuery] = useState('')
  
  const router = useRouter()

  // ==========================================
  // 2. FETCH TASKS FROM DATABASE
  // ==========================================
  useEffect(() => {
    const loadTasks = async () => {
      
      try {
        // Step A: Check if the user is logged in.
        const { data: { session } } = await supabase.auth.getSession()
        
        // If not logged in, kick them to the login page.
        if (!session) {
          router.push('/login')
          return
        }

        // Step B: Fetch the open jobs from the database.
        const { data, error } = await supabase
          .from('micro_tasks')
          .select('*')
          .eq('status', 'open')

        // If the database returns an error, throw it so the catch block handles it.
        if (error) throw error 
        
        // Step C: Save the data to our state.
        if (data) setTasks(data)
        
      } catch (err) {
        // If something goes wrong (network error, database error), log it.
        console.error("Error fetching tasks:", err)
      } finally {
        // ==========================================
        // THE CRITICAL FIX IS HERE
        // ==========================================
        // 'finally' runs NO MATTER WHAT happens in the try/catch block.
        // Whether the fetch succeeds or fails, this turns off the skeleton loader.
        // Without this line, the page gets stuck on the skeleton forever!
        setLoading(false)
      }
    }
    
    loadTasks()
  }, [router]) // Re-runs if the router changes.

  // ==========================================
  // 3. FILTER LOGIC (SEARCH)
  // ==========================================
  // This filters the tasks array based on what the user types in the search bar.
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ==========================================
  // 4. SKELETON LOADING UI
  // ==========================================
  // If 'loading' is true, we return this UI instead of the actual page.
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] pb-20">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white px-5 lg:px-8">
          <Link href="/dashboard" className="text-sm font-bold text-slate-500">
            ← Back to Dashboard
          </Link>
        </header>
        
        <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          {/* Pulsing blocks mimicking the page title and search bar */}
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200 mb-2" />
          <div className="h-4 w-96 animate-pulse rounded bg-slate-200 mb-6" />
          
          <div className="flex gap-3 mb-8">
            <div className="h-12 flex-1 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-12 w-32 animate-pulse rounded-xl bg-slate-200" />
          </div>

          {/* Pulsing blocks mimicking the job cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex justify-between mb-4">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
                  <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
                </div>
                <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200 mb-2" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 mb-6" />
                <div className="flex justify-between">
                  <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  // ==========================================
  // 5. MAIN UI (Shown after loading finishes)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-20">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-black">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <PageTitle title="Find opportunities" text="Short, paid work matched to what you can do." />

        {/* Search and Filter Bar */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" size={19} />
            </span>
            <input 
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search by role or skill" 
              value={searchQuery} 
            />
          </label>
          <select className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 outline-none">
            <option>Any location</option>
            <option>Remote</option>
          </select>
          <select className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 outline-none">
            <option>Any pay</option>
            <option>R1,000+</option>
          </select>
        </div>

        {/* Task Count */}
        <p className="mt-7 text-sm font-semibold text-slate-500">
          {filteredTasks.length} open opportunities
        </p>
        
        {/* Empty State or Task Grid */}
        {filteredTasks.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
              <Icon name="search" />
            </span>
            <h2 className="mt-4 font-extrabold text-slate-900">No opportunities found</h2>
            <p className="mt-1 text-sm text-slate-500">Try a different role, skill or filter.</p>
          </div>
        ) : (
          <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTasks.map((task) => (
              <button 
                key={task.id}
                onClick={() => router.push(`/tasks/${task.id}`)}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
                    <Icon name="briefcase" />
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">
                    92% match
                  </span>
                </div>
                <h3 className="mt-5 text-base font-extrabold text-slate-950 group-hover:text-blue-700">
                  {task.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{task.employer_name}</p>
                <div className="my-4 h-px bg-slate-100" />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-extrabold text-slate-900">R{task.pay_amount.toLocaleString()}</span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Icon name="clock" size={16} />
                    {task.duration_days} {task.duration_days === 1 ? "day" : "days"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}