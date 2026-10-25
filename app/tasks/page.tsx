'use client'
// Client component: uses React hooks (useState, useEffect) and reads user clicks.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon, PageTitle } from '@/components/ui'

// ==========================================
// 1. TYPESCRIPT TYPES & SYNONYMS
// ==========================================
type Task = {
  id: string
  title: string
  description: string
  pay_amount: number
  duration_days: number
  employer_name: string
  location: string | null
  skills_required?: string[] | null
}

// THE MAGIC: A lightweight dictionary to connect similar skills.
// If a user has the key skill, they get partial credit for the related skills.
const RELATED_SKILLS: Record<string, string[]> = {
  'customer service': ['communication', 'sales', 'support', 'retail', 'organisation'],
  'cash handling': ['record keeping', 'finance', 'math', 'attention to detail'],
  'point of sale operation': ['cash handling', 'retail', 'sales', 'customer service'],
  'social media': ['marketing', 'design', 'communication', 'copywriting'],
  'tutoring': ['teaching', 'patience', 'communication', 'mathematics'],
  'data entry': ['excel', 'attention to detail', 'typing', 'organisation']
}

export default function TasksPage() {
  
  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [userSkills, setUserSkills] = useState<string[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('Any location')
  const [payFilter, setPayFilter] = useState('Any pay')

  const router = useRouter()

  // ==========================================
  // 2. FETCH DATA ON LOAD
  // ==========================================
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return router.push('/login')

        const { data, error } = await supabase
          .from('micro_tasks')
          .select('*')
          .eq('status', 'open')

        if (error) throw error
        if (data) setTasks(data)

        const { data: skillsData } = await supabase
          .from('skills')
          .select('name')
          .eq('profile_id', session.user.id)

        if (skillsData) {
          setUserSkills(skillsData.map((s) => s.name))
        }
      } catch (err) {
        console.error('Error fetching tasks:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [router])

  // ==========================================
  // 3. SMART MATCHING & SORTING LOGIC
  // ==========================================
  
  const tasksWithMatchScore = tasks.map((task) => {
    const lowerUserSkills = userSkills.map(s => s.toLowerCase())
    const required = task.skills_required || []
    
    let matchedPoints = 0

    // Loop through the job's required skills
    required.forEach(reqSkill => {
      const lowerReq = reqSkill.toLowerCase()
      
      // 1. Check for an exact match (worth 1 full point)
      if (lowerUserSkills.includes(lowerReq)) {
        matchedPoints += 1
        return
      }

      // 2. Check for a related/synonym match (worth 0.5 points)
      const hasRelatedSkill = lowerUserSkills.some(userSkill => 
        RELATED_SKILLS[userSkill]?.includes(lowerReq) || 
        RELATED_SKILLS[lowerReq]?.includes(userSkill)
      )
      
      if (hasRelatedSkill) {
        matchedPoints += 0.5 
      }
    })

    const totalRequired = required.length
    
    // Calculate percentage (capped at 100)
    const matchPercentage = totalRequired > 0 
      ? Math.min(100, Math.round((matchedPoints / totalRequired) * 100))
      : 0

    return { ...task, matchPercentage }
  })

  const filteredTasks = tasksWithMatchScore.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLocation =
      locationFilter === 'Any location' ||
      (task.location && task.location.toLowerCase().includes(locationFilter.toLowerCase()))

    let matchesPay = true
    if (payFilter === 'R1,000+') matchesPay = task.pay_amount >= 1000
    if (payFilter === 'R1,500+') matchesPay = task.pay_amount >= 1500

    return matchesSearch && matchesLocation && matchesPay
  })

  // Sort highest percentage to lowest
  filteredTasks.sort((a, b) => b.matchPercentage - a.matchPercentage)

  // ==========================================
  // 4. LOADING SKELETON
  // ==========================================
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
        <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
        <div className="flex gap-3 mb-8">
          <div className="h-12 flex-1 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-12 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    )
  }

  // ==========================================
  // 5. RENDER THE UI
  // ==========================================
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <PageTitle title="Find opportunities" text="Short, paid work matched to what you can do." />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <Icon name="search" size={19} />
          </span>
          <input
            className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-11 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role or skill"
            value={searchQuery}
          />
        </label>

        <select
          className="h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300 outline-none cursor-pointer transition"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option className="dark:bg-slate-800">Any location</option>
          <option className="dark:bg-slate-800">Remote</option>
          <option className="dark:bg-slate-800">Windhoek</option>
          <option className="dark:bg-slate-800">Cape Town</option>
          <option className="dark:bg-slate-800">Johannesburg</option>
        </select>

        <select
          className="h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300 outline-none cursor-pointer transition"
          value={payFilter}
          onChange={(e) => setPayFilter(e.target.value)}
        >
          <option className="dark:bg-slate-800">Any pay</option>
          <option className="dark:bg-slate-800">R1,000+</option>
          <option className="dark:bg-slate-800">R1,500+</option>
        </select>
      </div>

      <p className="mt-7 text-sm font-semibold text-slate-500 dark:text-slate-400">
        {filteredTasks.length} open opportunities
      </p>

      {filteredTasks.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-12 text-center transition-colors duration-200">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300">
            <Icon name="search" />
          </span>
          <h2 className="mt-4 font-extrabold text-slate-900 dark:text-white">No opportunities found</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try a different role, skill or filter.</p>
        </div>
      ) : (
        <>
          <div className="mt-4 mb-4 flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm font-semibold text-amber-800 dark:text-amber-300">
            <Icon name="lock" size={18} />
            Vouch is free. Never pay anyone to apply for a gig.
          </div>

          <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTasks.map((task) => {
              return (
                <button
                  key={task.id}
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                      <Icon name="briefcase" />
                    </span>

                    <div className="flex items-center gap-2">
                      {task.matchPercentage > 0 ? (
                        <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
                          {task.matchPercentage}% match
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-extrabold text-slate-600 dark:text-slate-300">
                          Open
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-5 text-base font-extrabold text-slate-950 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    {task.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.employer_name}</p>
                  
                  <div className="my-4 h-px bg-slate-100 dark:bg-slate-700" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">
                      R{task.pay_amount.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Icon name="clock" size={16} />
                      {task.duration_days} {task.duration_days === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}