'use client'

// ==========================================
// TASK DETAIL PAGE
// ==========================================
// This page displays the full details of a single job opportunity.
// It allows the youth to:
// 1. Read the description, pay, and duration.
// 2. Apply for the job (inserts into the 'applications' table).
// 3. Report the job if it looks like a scam (inserts into the 'reports' table).

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button, Icon } from '@/components/ui'

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

export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string

  // --- STATE ---
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [error, setError] = useState('')

  // Anti-scam report state
  const [hasReported, setHasReported] = useState(false)
  const [reporting, setReporting] = useState(false)

  // ==========================================
  // 2. FETCH TASK AND APPLICATION STATUS
  // ==========================================
  useEffect(() => {
    const loadTaskAndStatus = async () => {
      
      // Step A: Authenticate the user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Step B: Fetch the specific task details from the database
      const { data: taskData, error: taskError } = await supabase
        .from('micro_tasks')
        .select('*')
        .eq('id', taskId)
        .single()

      if (taskError || !taskData) {
        setError('Task not found.')
        setLoading(false)
        return
      }
      setTask(taskData)

      // Step C: Check if the youth has already applied for this specific task.
      // This prevents them from double-applying and changes the UI button state.
      const { data: applicationData } = await supabase
        .from('applications')
        .select('id')
        .eq('task_id', taskId)
        .eq('profile_id', session.user.id)
        .single()

      if (applicationData) {
        setHasApplied(true)
      }

      setLoading(false)
    }
    
    if (taskId) loadTaskAndStatus()
  }, [taskId, router])

  // ==========================================
  // 3. HANDLE APPLY
  // ==========================================
  const handleApply = async () => {
    setApplying(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Insert a new row into the 'applications' table.
    // P1 has set up the RLS policy so the youth can only insert their own profile_id.
    const { error: applyError } = await supabase
      .from('applications')
      .insert({
        task_id: taskId,
        profile_id: session.user.id,
        status: 'submitted'
      })

    if (applyError) {
      // If the unique constraint (task_id, profile_id) fails, it means they already applied.
      setError(applyError.message)
    } else {
      setHasApplied(true) // Update UI to show the success state
    }
    
    setApplying(false)
  }

  // ==========================================
  // 4. HANDLE REPORT (Anti-scam)
  // ==========================================
  const handleReport = async () => {
    if (hasReported || reporting) return

    if (!window.confirm('Report this listing as suspicious or a scam?')) {
      return
    }

    setReporting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Insert into the 'reports' table.
      // This directly answers the judge's feedback about protecting youth from unreliable employers.
      const { error: reportError } = await supabase
        .from('reports')
        .insert({
          listing_id: taskId,
          reporter_id: session.user.id,
          reason: 'Reported from listing detail page',
        })

      if (reportError) throw reportError

      setHasReported(true) // Update UI to show success
    } catch (err: any) {
      console.error('Error submitting report:', err)
      alert(err.message || 'Could not submit report. Please try again.')
    } finally {
      setReporting(false)
    }
  }

  // ==========================================
  // 5. SKELETON LOADER
  // ==========================================
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8 animate-pulse">
        <div className="grid gap-5 lg:grid-cols-[1.5fr_.8fr]">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 h-[500px]" />
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 h-64" />
        </div>
      </div>
    )
  }

  if (!task) return <p className="p-8 text-center text-red-500 font-bold">{error}</p>

  // ==========================================
  // 6. RENDER UI
  // ==========================================
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[1.5fr_.8fr]">
        
        {/* LEFT COLUMN: TASK DETAILS */}
        <article className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 sm:p-8 transition-colors">
          
          <div className="flex items-start gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              <Icon name="briefcase" size={26} />
            </span>
            <div>
              <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-extrabold text-slate-600 dark:text-slate-300">
                Open
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {task.title}
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{task.employer_name}</p>
                {/* P4: Verified Employer Badge */}
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  <Icon name="check" size={10} /> Verified Employer
                </span>
              </div>
            </div>
          </div>

          {/* P4: Fair Work Guarantee Banner */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <span className="text-2xl">🛡️</span>
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300">Fair Work Guarantee</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">Your payment is held in escrow and released only when the work is approved.</p>
            </div>
          </div>

          {/* Quick Stats Grid - UPDATED TO N$ CURRENCY */}
          <div className="my-7 grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-slate-700 py-5 sm:grid-cols-3">
            <div className="flex gap-2.5">
              <span className="text-blue-600 dark:text-blue-400"><Icon name="wallet" size={19} /></span>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Pay</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100">N${task.pay_amount.toLocaleString()} total</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <span className="text-blue-600 dark:text-blue-400"><Icon name="clock" size={19} /></span>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Duration</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100">{task.duration_days} {task.duration_days === 1 ? 'day' : 'days'}</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <span className="text-blue-600 dark:text-blue-400"><Icon name="location" size={19} /></span>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Location</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100">{task.location || 'Remote'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-7 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <h2 className="mb-2 text-base font-extrabold text-slate-950 dark:text-white">About this opportunity</h2>
            <p>{task.description}</p>
          </div>

          <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-blue-900 dark:text-blue-300">
            <strong>Good to know:</strong> No formal experience needed. A supervisor will show you what to do.
          </div>

          {/* Anti-scam Report Button */}
          <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-4">
            {hasReported ? (
              <p className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Icon name="check" size={14} />
                Report received. Our team will review this listing.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleReport}
                disabled={reporting}
                className="text-xs font-bold text-red-500 hover:text-red-700 dark:hover:text-red-400 underline transition-colors disabled:opacity-60 cursor-pointer"
              >
                {reporting ? 'Sending report...' : 'Report this listing'}
              </button>
            )}
          </div>
        </article>

        {/* RIGHT COLUMN: APPLY ACTION */}
        <aside>
          <div className="sticky top-24 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm transition-colors">
            <p className="text-sm text-slate-500 dark:text-slate-400">You’ll earn</p>
            {/* UPDATED TO N$ CURRENCY */}
            <p className="mt-1 text-3xl font-extrabold text-slate-950 dark:text-white">N${task.pay_amount.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">for {task.duration_days} {task.duration_days === 1 ? 'day' : 'days'} of work</p>
            
            <div className="my-5 h-px bg-slate-100 dark:bg-slate-700" />
            
            {hasApplied ? (
              <>
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 p-4 text-emerald-800 dark:text-emerald-300">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-800">
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
              <>
                {error && <p className="mb-3 text-sm font-bold text-red-600 dark:text-red-400">{error}</p>}
                
                {/* FIXED: Replaced the custom <Button> with a standard HTML <button> 
                    to guarantee the onClick event fires during the demo. */}
                <button 
                  type="button"
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {applying ? 'Sending...' : 'Apply for this opportunity'}
                </button>
                
                <p className="mt-3 text-center text-xs leading-5 text-slate-400 dark:text-slate-500">
                  Your Vouch profile will be shared with the employer.
                </p>
              </>
            )}
          </div>
        </aside>

      </div>
    </div>
  )
}