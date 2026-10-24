'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button, Icon, PageTitle } from '@/components/ui'

type Profile = {
  id: string
  full_name: string | null
  trust_score: number | null
  bio: string | null
  location: string | null
}

type Task = {
  id: string
  title: string
  employer_name: string
  pay_amount: number
  duration_days: number
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [skillsCount, setSkillsCount] = useState(0)
  const [expCount, setExpCount] = useState(0)
  const [profileStrength, setProfileStrength] = useState(0)
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, trust_score, bio, location')
        .eq('id', session.user.id)
        .single()

      const { count: skillsCountResult } = await supabase
        .from('skills')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', session.user.id)

      const { count: expCountResult } = await supabase
        .from('experiences')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', session.user.id)

      const { data: taskData } = await supabase
        .from('micro_tasks')
        .select('id, title, employer_name, pay_amount, duration_days')
        .eq('status', 'open')
        .limit(2)

      let score = 0
      if (data?.full_name && data?.location) score += 30
      if (data?.bio) score += 20
      if (skillsCountResult && skillsCountResult > 0) score += 25
      if (expCountResult && expCountResult > 0) score += 25

      setProfile(data)
      setProfileStrength(score)
      setSkillsCount(skillsCountResult ?? 0)
      setExpCount(expCountResult ?? 0)
      setRecentTasks(taskData || [])
      setLoading(false)
    }
    load()
  }, [router])

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'
  const todayDate = new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })

  // NEW: Dynamic Trust Score Breakdown calculation
  const skillsScore = Math.min(80, skillsCount * 20) // 4 skills maxes it out
  const gigsScore = Math.min(40, expCount * 20) // 2 gigs maxes it out
  const sharedScore = profile?.bio ? 10 : 0 // 10 points if they have a bio

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8 animate-pulse">
        <div className="mb-8 space-y-3">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-8 w-64 bg-slate-300 dark:bg-slate-600 rounded" />
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-3xl" />
          <div className="h-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
      
      <PageTitle
        eyebrow={todayDate}
        title={`${greeting}, ${profile?.full_name?.split(' ')[0] || 'friend'}`}
        text="Here's your next best step."
      />

      <section className="mt-7 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-blue-700 p-6 text-white sm:p-8 shadow-sm">
          <div className="relative z-10 max-w-lg">
            <span className="inline-flex rounded-full bg-blue-500/40 px-3 py-1 text-xs font-bold text-blue-50">PROFILE TIP</span>
            <h2 className="mt-5 text-2xl font-extrabold sm:text-3xl">
              {expCount === 0 ? 'Turn your daily grind into gold' : skillsCount === 0 ? 'Add your first skills' : 'Apply for your first gig'}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-blue-100">
              {expCount === 0 ? "We'll help turn what you did into skills employers understand. It takes less than 3 minutes." : skillsCount === 0 ? 'Let our AI extract your skills from your experience.' : 'Find short, paid work matched to your new skills.'}
            </p>
            <Button className="mt-6" icon="arrow" kind="secondary" href={expCount === 0 || skillsCount === 0 ? '/hustle' : '/tasks'}>
              {expCount === 0 ? 'Log an experience' : skillsCount === 0 ? 'Get skills' : 'Find gigs'}
            </Button>
          </div>
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full border-[55px] border-blue-600" />
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 transition-colors duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Profile strength</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Self-reported</p>
            </div>
            <span className="text-3xl font-extrabold text-slate-950 dark:text-white">{profileStrength}%</span>
          </div>
          <div className="mt-5 h-2 rounded-full bg-slate-100 dark:bg-slate-700">
            <div className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500" style={{ width: `${profileStrength}%` }} />
          </div>
          
          {/* NEW: Dynamic Trust Score Breakdown */}
          <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Skills ({skillsScore}/80) · Gigs ({gigsScore}/40) · Profile Shared ({sharedScore}/10)
          </p>
          
          {/* NEW: Dynamic Checklist */}
          <ul className="mt-5 space-y-3 text-sm">
            <li className={`flex items-center gap-2 ${profile?.full_name && profile?.location ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
              <span className={`grid h-5 w-5 place-items-center rounded-full ${profile?.full_name && profile?.location ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'border border-slate-200 dark:border-slate-700'}`}>
                {profile?.full_name && profile?.location && <Icon name="check" size={13} />}
              </span>
              {profile?.full_name && profile?.location ? 'Basic details added' : 'Add basic details'}
            </li>
            <li className={`flex items-center gap-2 ${skillsCount > 0 ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
              <span className={`grid h-5 w-5 place-items-center rounded-full ${skillsCount > 0 ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'border border-slate-200 dark:border-slate-700'}`}>
                {skillsCount > 0 && <Icon name="check" size={13} />}
              </span>
              {skillsCount > 0 ? `Skills added (${skillsCount})` : 'Add your first skills'}
            </li>
            <li className={`flex items-center gap-2 ${expCount > 0 ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
              <span className={`grid h-5 w-5 place-items-center rounded-full ${expCount > 0 ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'border border-slate-200 dark:border-slate-700'}`}>
                {expCount > 0 && <Icon name="check" size={13} />}
              </span>
              {expCount > 0 ? `Experience logged (${expCount})` : 'Log a completed gig'}
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-9">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Good matches for you</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Based on your self-reported skills</p>
          </div>
          <button className="hidden text-sm font-bold text-blue-600 dark:text-blue-400 sm:block" onClick={() => router.push('/tasks')}>
            View all opportunities
          </button>
        </div>
        
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          
          {recentTasks.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 col-span-2">No opportunities available right now.</p>
          ) : (
            recentTasks.map((task) => (
              <button 
                key={task.id}
                onClick={() => router.push(`/tasks/${task.id}`)}
                className="group w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400"><Icon name="briefcase" /></span>
                  {/* FIX: Removed hardcoded 92% match and replaced with a safer label */}
                  <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-extrabold text-slate-600 dark:text-slate-300">Open</span>
                </div>
                <h3 className="mt-5 text-base font-extrabold text-slate-950 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{task.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.employer_name}</p>
                <div className="my-4 h-px bg-slate-100 dark:bg-slate-700" />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">R{task.pay_amount.toLocaleString()}</span>
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Icon name="clock" size={16} />{task.duration_days} {task.duration_days === 1 ? 'day' : 'days'}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  )
}