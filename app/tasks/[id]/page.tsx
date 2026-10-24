'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
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
  
  // ==========================================
  // 2. DYNAMIC ROUTING
  // ==========================================
  const params = useParams()
  const taskId = params.id as string

  // --- STATE ---
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [error, setError] = useState('')

  // ==========================================
  // 3. FETCH TASK
  // ==========================================
  useEffect(() => {
    const loadTaskAndStatus = async () => {
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

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
  // 4. HANDLE APPLY
  // ==========================================
  const handleApply = async () => {
    setApplying(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error: applyError } = await supabase
      .from('applications')
      .insert({
        task_id: taskId,
        profile_id: session.user.id,
        status: 'submitted'
      })

    if (applyError) {
      setError(applyError.message)
    } else {
      setHasApplied(true)
    }
    
    setApplying(false)
  }

  // ==========================================
  // 5. SKELETON LOADER UI
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 pb-20 transition-colors">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-5 lg:px-8">
           <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </header>
        
        <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[1.5fr_.8fr]">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="space-y-3 flex-1">
                  <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                  <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              </div>
              <div className="my-7 grid grid-cols-3 gap-4 border-y border-slate-100 dark:border-slate-700 py-5">
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 h-64">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
              <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse mt-8" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!task) return <p className="p-8 text-center text-red-500">{error}</p>

  // ==========================================
  // 6. RENDER THE ACTUAL UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 pb-20 transition-colors">
      
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-5 lg:px-8 transition-colors">
        <Link href="/tasks" className="flex items-center gap-1 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">
          <Icon name="back" size={18} />
          All opportunities
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.5fr_.8fr]">
          
          <article className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 sm:p-8 transition-colors">
            <div className="flex items-start gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                <Icon name="briefcase" size={26} />
              </span>
              <div>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                  92% skills match
                </span>
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  {task.title}
                </h1>
                <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{task.employer_name}</p>
              </div>
            </div>

            <div className="my-7 grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-slate-700 py-5 sm:grid-cols-3">
              <div className="flex gap-2.5">
                <span className="text-blue-600 dark:text-blue-400"><Icon name="wallet" size={19} /></span>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Pay</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100">R{task.pay_amount.toLocaleString()} total</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="text-blue-600 dark:text-blue-400"><Icon name="clock" size={19} /></span>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Duration</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100">{task.duration_days} days</p>
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

            <div className="mb-7 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <h2 className="mb-2 text-base font-extrabold text-slate-950 dark:text-white">About this opportunity</h2>
              <p>{task.description}</p>
            </div>

            <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-blue-900 dark:text-blue-300">
              <strong>Good to know:</strong> No formal experience needed. A supervisor will show you what to do.
            </div>
          </article>

          <aside>
            <div className="sticky top-24 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm transition-colors">
              <p className="text-sm text-slate-500 dark:text-slate-400">You’ll earn</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-950 dark:text-white">R{task.pay_amount.toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">for {task.duration_days} days of work</p>
              
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
                  <Button 
                    className="w-full" 
                    disabled={applying}
                    onClick={handleApply}
                  >
                    {applying ? 'Sending...' : 'Apply for this opportunity'}
                  </Button>
                  <p className="mt-3 text-center text-xs leading-5 text-slate-400 dark:text-slate-500">
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