'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Icon, PageTitle } from '@/components/ui'

// ==========================================
// 1. TYPESCRIPT TYPES
// ==========================================
type Application = {
  id: string
  status: string
  created_at: string
  micro_tasks: {
    title: string
    employer_name: string
  }
}

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // ==========================================
  // 3. FETCH APPLICATIONS
  // ==========================================
  useEffect(() => {
    const loadApplications = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          micro_tasks (
            title,
            employer_name
          )
        `)
        .eq('profile_id', session.user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setApplications(data as unknown as Application[])
      }
      setLoading(false)
    }
    loadApplications()
  }, [router])

  // ==========================================
  // 4. SKELETON LOADER
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 pb-20 transition-colors">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-5 lg:px-8" />
        <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5">
                <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  // ==========================================
  // 5. RENDER THE UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 pb-20 transition-colors">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-5 lg:px-8 transition-colors">
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        <PageTitle 
          title="My applications" 
          text="Keep track of your opportunities in one place." 
        />

        {applications.length === 0 ? (
          <div className="mt-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-12 text-center transition-colors">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500">
              <Icon name="briefcase" />
            </span>
            <h2 className="mt-4 font-extrabold text-slate-900 dark:text-white">No applications yet</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Head over to the opportunities board to find your first task.</p>
            <Link 
              href="/tasks" 
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Find opportunities
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {applications.map((app) => (
              <div 
                key={app.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 text-left sm:flex-row sm:items-center transition-colors"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Icon name="briefcase" />
                </span>
                <div className="flex-1">
                  <h2 className="font-extrabold text-slate-950 dark:text-white">
                    {app.micro_tasks.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {app.micro_tasks.employer_name} · Applied {new Date(app.created_at).toLocaleDateString('en-ZA')}
                  </p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-extrabold ${
                  app.status === 'submitted' 
                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' 
                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                }`}>
                  {app.status === 'submitted' ? 'Submitted' : 'Accepted'}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}