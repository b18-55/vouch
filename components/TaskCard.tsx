'use client'

import { Icon } from './ui'
import { useRouter } from 'next/navigation'

/**
 * TaskCard Component
 * 
 * Architecture:
 * Renders a single micro-internship opportunity.
 * 
 * Localization:
 * Dynamically renders 'N$' or 'R' based on the job's location to support both
 * Namibia and South Africa.
 */
interface Task {
  id: string
  title: string
  employer_name: string
  pay_amount: number
  duration_days: number
  location?: string | null
  skills_required?: string[] | null
}

interface TaskCardProps {
  task: Task
  userSkills: string[]
}

export default function TaskCard({ task, userSkills }: TaskCardProps) {
  const router = useRouter()

  // 1. Match Calculation Logic
  const totalRequired = task.skills_required?.length || 0
  const matchedSkills = (task.skills_required || []).filter((skill) => 
    userSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
  ).length
  const matchPercentage = totalRequired > 0 ? Math.round((matchedSkills / totalRequired) * 100) : 0

  // 2. Dynamic Currency Logic
  const isNamibia = task.location?.toLowerCase().includes('namibia')
  const currency = isNamibia ? 'N$' : 'R'

  return (
    <button 
      onClick={() => router.push(`/tasks/${task.id}`)} 
      className="group w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
          <Icon name="briefcase" />
        </span>

        <div className="flex flex-col items-end gap-1">
          {matchPercentage > 0 ? (
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
              {matchPercentage}% match
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-extrabold text-slate-600 dark:text-slate-300">
              Open
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
            <Icon name="lock" size={10} /> Escrow Protected
          </span>
        </div>
      </div>

      <h3 className="mt-5 text-base font-extrabold text-slate-950 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
        {task.title}
      </h3>
      
      <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <span>{task.employer_name}</span>
        <span className="flex items-center gap-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
          <Icon name="check" size={10} /> Verified
        </span>
      </div>
      
      <div className="my-4 h-px bg-slate-100 dark:bg-slate-700" />
      
      <div className="flex items-center justify-between text-sm">
        <span className="font-extrabold text-slate-900 dark:text-slate-100">
          {currency}{task.pay_amount.toLocaleString('en-ZA')}
        </span>
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Icon name="clock" size={16} />
          {task.duration_days} {task.duration_days === 1 ? 'day' : 'days'}
        </span>
      </div>
    </button>
  )
}