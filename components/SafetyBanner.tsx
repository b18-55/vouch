import { Icon } from './ui'

/**
 * SAFETY BANNER COMPONENT
 * 
 * Why this exists: 
 * Judges specifically asked how we protect youth from scams and unpaid work.
 * This visible banner on the task board shows that Vouch is a zero-fee platform 
 * and actively warns users against predatory employers.
 */
export default function SafetyBanner() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm font-semibold text-amber-800 dark:text-amber-300">
      <div className="mt-0.5">
        <Icon name="lock" size={18} />
      </div>
      <div>
        <p className="font-bold">Vouch is free. Never pay to apply for a gig.</p>
        <p className="text-xs font-normal mt-1 opacity-90">If an employer asks you for money, report them immediately using the Report button.</p>
      </div>
    </div>
  )
}
