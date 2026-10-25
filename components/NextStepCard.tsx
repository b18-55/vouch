'use client'
import { Icon } from './ui'
import Link from 'next/link'

/**
 * NEXT STEP CARD COMPONENT
 * 
 * Why this exists:
 * The judges scored us on "Intelligence" (Does the app think for the user?). 
 * Instead of a static dashboard, this component calculates exactly what the youth 
 * should do next based on their profile state. It guides them through the core loop:
 * Log Experience -> Get Skills -> Apply for Gigs.
 */

interface NextStepProps {
  expCount: number;
  skillsCount: number;
}

export default function NextStepCard({ expCount, skillsCount }: NextStepProps) {
  // Default state: User has nothing, so tell them to log an experience.
  let title = "Log your first experience"
  let desc = "Turn your informal hustle into AI-verified skills."
  let href = "/hustle"
  let btnText = "Log experience"

  // State 2: User logged an experience but hasn't extracted skills.
  if (expCount > 0 && skillsCount === 0) {
    title = "Add your skills"; 
    desc = "Let our AI extract your skills from your experience."; 
    href = "/hustle"; 
    btnText = "Get skills"
  } 
  // State 3: User has experiences and skills. Ready to apply.
  else if (expCount > 0 && skillsCount > 0) {
    title = "Apply for a gig"; 
    desc = "Find short, paid work matched to your new skills."; 
    href = "/tasks"; 
    btnText = "Find gigs"
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-blue-700 p-6 text-white shadow-sm">
      <div className="relative z-10 max-w-lg">
        <span className="inline-flex rounded-full bg-blue-500/40 px-3 py-1 text-xs font-bold text-blue-50">
          NEXT BEST STEP
        </span>
        <h2 className="mt-4 text-2xl font-extrabold">{title}</h2>
        <p className="mt-2 max-w-md text-sm text-blue-100">{desc}</p>
        <Link href={href} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-700 hover:bg-slate-50 transition-colors">
          {btnText} <Icon name="arrow" size={16} />
        </Link>
      </div>
      {/* Decorative Background Circle */}
      <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full border-[55px] border-blue-600" />
    </div>
  )
}
