'use client'
// 'use client' tells Next.js this page runs in the browser.
// We need this because we use React state (to hold the tasks) 
// and Next.js routing (to navigate when a task is clicked).

// --- IMPORTS ---
import { useEffect, useState } from 'react'
// useEffect: Runs code when the page first loads (fetching the tasks).
// useState: Holds the tasks so the screen updates when they arrive.

import { useRouter } from 'next/navigation'
// Lets us redirect the user (e.g., to /login if they aren't logged in, or to /tasks/123 if they click a task).

import Link from 'next/link'
// Next.js's fast navigation component. Used for the "Back to Dashboard" button.

import { supabase } from '@/lib/supabase'
// Our secure connection to the database.

import { Icon, PageTitle } from '@/components/ui'
// Reusable UI components from your teammate (the icons and page header).

// ==========================================
// 1. TYPESCRIPT TYPES
// ==========================================
// We define the exact shape of a 'Task' object based on our Supabase table.
// This helps TypeScript catch errors (e.g., if we misspell 'pay_amount').
type Task = {
  id: string
  title: string
  description: string
  pay_amount: number
  duration_days: number
  employer_name: string
  location: string | null
}

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function TasksPage() {
  
  // --- STATE ---
  // 'tasks' holds the array of jobs we fetch from the database. Starts empty.
  const [tasks, setTasks] = useState<Task[]>([])
  
  // 'loading' is true while we wait for the database. It hides the page until the data is ready.
  const [loading, setLoading] = useState(true)
  
  // 'searchQuery' holds the text the user types into the search bar.
  const [searchQuery, setSearchQuery] = useState('') 
  
  // Initializes the router so we can navigate to other pages.
  const router = useRouter()

  // --- FETCH TASKS ON LOAD ---
  // This runs automatically when the page opens.
  useEffect(() => {
    const loadTasks = async () => {
      
      // 1. SECURITY CHECK: Check if the user is actually logged in.
      const { data: { session } } = await supabase.auth.getSession()
      
      // If there is no session, kick them back to the login page and stop.
      if (!session) {
        router.push('/login')
        return
      }

      // 2. FETCH DATA: Ask Supabase for all tasks.
      const { data, error } = await supabase
        .from('micro_tasks') // The table name in Supabase
        .select('*')         // Get all columns
        .eq('status', 'open') // ONLY get tasks where the status is 'open' (don't show taken tasks)

      // 3. SAVE DATA: If we got data back, save it to our state.
      if (data) {
        setTasks(data)
      }
      
      // 4. STOP LOADING: We are done, so hide the loading spinner.
      setLoading(false)
    }
    
    loadTasks()
  }, [router]) // Dependency array: this effect depends on 'router'.

  // ==========================================
  // 3. FILTER LOGIC (The Hackathon Feature)
  // ==========================================
  // This checks if the user typed anything in the search bar.
  // If they did, it filters the 'tasks' array to only show tasks whose title matches the search.
  // If the search is empty, it shows all tasks.
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // If we are still loading the data, show a simple text message instead of the page.
  if (loading) return <p className="p-8 text-center text-slate-500">Loading opportunities...</p>

  // ==========================================
  // 4. RENDER THE PAGE
  // ==========================================
  return (
    // 'min-h-screen' makes the background fill the whole screen.
    // 'bg-[#f7f9fc]' is the light blue/grey background color.
    <div className="min-h-screen bg-[#f7f9fc] pb-20">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-black">
          ← Back to Dashboard
        </Link>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        
        {/* Page Title (from teammate's UI component) */}
        <PageTitle 
          title="Find opportunities" 
          text="Short, paid work matched to what you can do." 
        />

        {/* --- SEARCH AND FILTER BAR --- */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          
          {/* Search Input */}
          <label className="relative flex-1">
            {/* The magnifying glass icon inside the input */}
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon name="search" size={19} />
            </span>
            
            {/* The actual text input */}
            <input 
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" 
              onChange={(e) => setSearchQuery(e.target.value)} // Updates state as they type
              placeholder="Search by role or skill" 
              value={searchQuery} 
            />
          </label>
          
          {/* Location Dropdown (Visual for now) */}
          <select className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 outline-none">
            <option>Any location</option>
            <option>Remote</option>
          </select>
          
          {/* Pay Dropdown (Visual for now) */}
          <select className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 outline-none">
            <option>Any pay</option>
            <option>R1,000+</option>
          </select>
        </div>

        {/* --- TASK COUNT --- */}
        {/* Shows how many tasks are currently visible (changes based on search) */}
        <p className="mt-7 text-sm font-semibold text-slate-500">
          {filteredTasks.length} open opportunities
        </p>
        
        {/* --- TASK LIST OR EMPTY STATE --- */}
        {filteredTasks.length === 0 ? (
          
          // EMPTY STATE: Show this if there are no tasks (or if the search didn't match anything)
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
              <Icon name="search" />
            </span>
            <h2 className="mt-4 font-extrabold text-slate-900">No opportunities found</h2>
            <p className="mt-1 text-sm text-slate-500">Try a different role, skill or filter.</p>
          </div>
          
        ) : (
          
          // TASK GRID: Show this if we have tasks
          <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            
            {/* Loop through every task in our filtered array and create a card for it */}
            {filteredTasks.map((task) => (
              
              <button 
                key={task.id}
                // When clicked, navigate to the task detail page (e.g., /tasks/123)
                onClick={() => router.push(`/tasks/${task.id}`)}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
              >
                
                {/* Top row of card: Icon and Match Score */}
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
                    <Icon name="briefcase" />
                  </span>
                  {/* Hardcoded match for demo, computed by AI later */}
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">
                    92% match
                  </span>
                </div>
                
                {/* Task Title */}
                <h3 className="mt-5 text-base font-extrabold text-slate-950 group-hover:text-blue-700">
                  {task.title}
                </h3>
                
                {/* Employer Name */}
                <p className="mt-1 text-sm text-slate-500">{task.employer_name}</p>
                
                {/* Divider Line */}
                <div className="my-4 h-px bg-slate-100" />
                
                {/* Bottom row of card: Pay and Duration */}
                <div className="flex items-center justify-between text-sm">
                  {/* Pay Amount (formatted with commas, e.g., R1,200) */}
                  <span className="font-extrabold text-slate-900">
                    R{task.pay_amount.toLocaleString()}
                  </span>
                  {/* Duration in days */}
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