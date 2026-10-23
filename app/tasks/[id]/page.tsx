'use client'
// 'use client' tells Next.js that this component runs in the browser.
// We need this because we use React state, read the URL, and handle button clicks.

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button, Icon } from '@/components/ui'

// ==========================================
// 1. TYPESCRIPT TYPES
// ==========================================
// This defines the exact shape of the data we expect from the 'micro_tasks' table.
type Task = {
  id: string
  title: string
  description: string
  pay_amount: number
  duration_days: number
  employer_name: string
  location: string | null
}

export default function TaskDetailPage() {
  const router = useRouter()
  
  // ==========================================
  // 2. DYNAMIC ROUTING (Reading the URL)
  // ==========================================
  // Because we named the folder '[id]', Next.js uses the 'useParams' hook 
  // to extract whatever is in that part of the URL.
  // If the URL is /tasks/abc-123, then taskId will be "abc-123".
  const params = useParams()
  const taskId = params.id as string

  // --- STATE MANAGEMENT ---
  const [task, setTask] = useState<Task | null>(null) // Holds the job details
  const [loading, setLoading] = useState(true)        // Shows the skeleton loader while fetching
  const [applying, setApplying] = useState(false)     // Shows "Sending..." on the Apply button
  const [hasApplied, setHasApplied] = useState(false) // Changes the UI to the green "Application sent" box
  const [error, setError] = useState('')              // Holds any database errors

  // ==========================================
  // 3. FETCH TASK AND CHECK APPLICATION STATUS
  // ==========================================
  // This runs once when the page loads.
  useEffect(() => {
    const loadTaskAndStatus = async () => {
      
      // Step A: Check if the user is logged in.
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login') // Kick them to login if not
        return
      }

      // Step B: Fetch the specific task from the database using the ID from the URL.
      const { data: taskData, error: taskError } = await supabase
        .from('micro_tasks')
        .select('*')
        .eq('id', taskId)
        .single() // We expect exactly one job to match this ID

      // If the job doesn't exist, or the database fails, show an error.
      if (taskError || !taskData) {
        setError('Task not found.')
        setLoading(false)
        return
      }
      setTask(taskData)

      // Step C: Check if the user has ALREADY applied for this job.
      // We search the 'applications' table for a row that matches BOTH 
      // this task's ID and this user's ID.
      const { data: applicationData } = await supabase
        .from('applications')
        .select('id')
        .eq('task_id', taskId)
        .eq('profile_id', session.user.id)
        .single()

      // If applicationData exists, it means they applied. 
      // We set hasApplied to true so the UI shows the green success box instead of the Apply button.
      if (applicationData) {
        setHasApplied(true)
      }

      // Step D: Turn off the skeleton loader.
      setLoading(false)
    }
    
    if (taskId) loadTaskAndStatus()
  }, [taskId, router]) // This effect re-runs if the taskId in the URL changes.

  // ==========================================
  // 4. HANDLE THE APPLY BUTTON CLICK
  // ==========================================
  const handleApply = async () => {
    setApplying(true) // Show "Sending..." on the button
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Insert a new row into the 'applications' table.
    // The RLS policy we wrote earlier ensures the user can only apply with their own profile_id.
    const { error: applyError } = await supabase
      .from('applications')
      .insert({
        task_id: taskId,
        profile_id: session.user.id,
        status: 'submitted'
      })

    if (applyError) {
      // If the unique constraint fails (they somehow clicked apply twice), show error.
      setError(applyError.message)
    } else {
      // Success! Update the UI to show the green success box.
      setHasApplied(true)
    }
    
    setApplying(false) // Stop the "Sending..." state
  }

  // ==========================================
  // 5. SKELETON LOADER UI
  // ==========================================
  // If we are still waiting for the database, show this pulsing layout 
  // instead of plain text.
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] pb-20">
        
        {/* Top Nav Skeleton */}
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white px-5 lg:px-8">
           <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
        </header>
        
        <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[1.5fr_.8fr]">
            
            {/* Left Skeleton (Job Details) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex items-start gap-4">
                {/* Icon placeholder */}
                <div className="h-14 w-14 rounded-xl bg-slate-200 animate-pulse" />
                <div className="space-y-3 flex-1">
                  {/* Match badge placeholder */}
                  <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
                  {/* Title placeholder */}
                  <div className="h-8 w-2/3 bg-slate-200 rounded animate-pulse" />
                  {/* Employer placeholder */}
                  <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
              
              {/* Quick facts placeholders (Pay, Duration, Location) */}
              <div className="my-7 grid grid-cols-3 gap-4 border-y border-slate-100 py-5">
                <div className="h-10 bg-slate-200 rounded animate-pulse" />
                <div className="h-10 bg-slate-200 rounded animate-pulse" />
                <div className="h-10 bg-slate-200 rounded animate-pulse" />
              </div>
              
              {/* Description placeholders */}
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Right Skeleton (Apply Card) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 h-64">
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-4" />
              <div className="h-10 w-32 bg-slate-200 rounded animate-pulse mb-2" />
              <div className="h-12 w-full bg-slate-200 rounded-xl animate-pulse mt-8" />
            </div>
            
          </div>
        </main>
      </div>
    )
  }

  // If loading is done, but the task is null (meaning it failed to load), show an error.
  if (!task) return <p className="p-8 text-center text-red-500">{error}</p>

  // ==========================================
  // 6. RENDER THE ACTUAL UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-20">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
        <Link href="/tasks" className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-black">
          <Icon name="back" size={18} />
          All opportunities
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.5fr_.8fr]">
          
          {/* ==========================================
              LEFT COLUMN: Full Job Details
              ========================================== */}
          <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            
            {/* Header: Icon, Title, Employer */}
            <div className="flex items-start gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-xl bg-amber-50 text-amber-700">
                <Icon name="briefcase" size={26} />
              </span>
              <div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">
                  92% skills match
                </span>
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                  {task.title}
                </h1>
                <p className="mt-1 text-sm font-semibold text-slate-500">{task.employer_name}</p>
              </div>
            </div>

            {/* Quick Facts: Pay, Duration, Location */}
            <div className="my-7 grid grid-cols-2 gap-4 border-y border-slate-100 py-5 sm:grid-cols-3">
              <div className="flex gap-2.5">
                <span className="text-blue-600"><Icon name="wallet" size={19} /></span>
                <div>
                  <p className="text-xs text-slate-400">Pay</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">R{task.pay_amount.toLocaleString()} total</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="text-blue-600"><Icon name="clock" size={19} /></span>
                <div>
                  <p className="text-xs text-slate-400">Duration</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">{task.duration_days} days</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="text-blue-600"><Icon name="location" size={19} /></span>
                <div>
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">{task.location || 'Remote'}</p>
                </div>
              </div>
            </div>

            {/* Full Job Description */}
            <div className="mb-7 text-sm leading-7 text-slate-600">
              <h2 className="mb-2 text-base font-extrabold text-slate-950">About this opportunity</h2>
              <p>{task.description}</p>
            </div>

            {/* Disclaimer Box */}
            <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
              <strong>Good to know:</strong> No formal experience needed. A supervisor will show you what to do.
            </div>
          </article>

          {/* ==========================================
              RIGHT COLUMN: The Apply Card
              ========================================== */}
          <aside>
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              
              <p className="text-sm text-slate-500">You’ll earn</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-950">R{task.pay_amount.toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-400">for {task.duration_days} days of work</p>
              
              <div className="my-5 h-px bg-slate-100" />
              
              {/* CONDITIONAL RENDERING: Show different UI based on application status */}
              {hasApplied ? (
                // UI STATE 1: They have already applied.
                <>
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100">
                      <Icon name="check" />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold">Application sent</p>
                      <p className="text-xs">{new Date().toLocaleDateString('en-ZA')}</p>
                    </div>
                  </div>
                  <Button className="mt-3 w-full" kind="secondary" href="/applications">
                    View my applications
                  </Button>
                </>
              ) : (
                // UI STATE 2: They haven't applied yet.
                <>
                  {error && <p className="mb-3 text-sm font-bold text-red-600">{error}</p>}
                  <Button 
                    className="w-full" 
                    disabled={applying}
                    onClick={handleApply}
                  >
                    {applying ? 'Sending...' : 'Apply for this opportunity'}
                  </Button>
                  <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                    Your Vouch profile will be shared with the employer.
                  </p>
                </>
              )}

            </div>
          </aside>

        </div>
      </main>
    </div>
  )
}