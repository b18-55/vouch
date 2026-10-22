'use client'
// 'use client' is required because we use React hooks (useState, useEffect) 
// and Next.js routing to make the page interactive.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Icon, PageTitle } from '@/components/ui'

// ==========================================
// 1. TYPESCRIPT TYPES
// ==========================================
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
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('') 
  const router = useRouter()

  // --- FETCH TASKS ON LOAD ---
  useEffect(() => {
    const loadTasks = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('micro_tasks')
        .select('*')
        .eq('status', 'open')

      if (data) {
        setTasks(data)
      }
      
      setLoading(false)
    }
    loadTasks()
  }, [router])

  // --- FILTER LOGIC ---
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ==========================================
  // 2. SKELETON LOADER (Replaces the text loading message)
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] pb-20">
        
        {/* Top Nav Skeleton */}
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white px-5 lg:px-8">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
        </header>

        <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="animate-pulse">
            {/* Title & Subtitle Skeleton */}
            <div className="h-8 w-64 rounded bg-slate-200" />
            <div className="mt-2 h-4 w-96 rounded bg-slate-200" />
            
            {/* Search Bar & Dropdowns Skeleton */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="h-12 flex-1 rounded-xl bg-slate-200" />
              <div className="h-12 w-full sm:w-32 rounded-xl bg-slate-200" />
              <div className="h-12 w-full sm:w-32 rounded-xl bg-slate-200" />
            </div>

            {/* Task Cards Grid Skeleton */}
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex justify-between">
                    <div className="h-10 w-10 rounded-xl bg-slate-200" />
                    <div className="h-6 w-20 rounded-full bg-slate-200" />
                  </div>
                  <div className="mt-5 h-5 w-3/4 rounded bg-slate-200" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
                  <div className="my-4 h-px bg-slate-200" />
                  <div className="flex justify-between">
                    <div className="h-5 w-16 rounded bg-slate-200" />
                    <div className="h-5 w-16 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ==========================================
  // 3. ACTUAL PAGE CONTENT
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
        
        {/* Page Title */}
        <PageTitle 
          title="Find opportunities" 
          text="Short, paid work matched to what you can do." 
        />

        {/* --- SEARCH AND FILTER BAR --- */}
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

        {/* --- TASK LIST --- */}
        <p className="mt-7 text-sm font-semibold text-slate-500">
          {filteredTasks.length} open opportunities
        </p>
        
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