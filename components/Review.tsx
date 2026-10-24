'use client'
// Client component: uses React state to track selected skills
// and to handle the async save flow.

import { useState, useEffect } from 'react'
import { Button, Icon, PageTitle } from './ui'
import Link from 'next/link'

// ==========================================
// Types
// ==========================================

export type SuggestedSkill = {
  name: string   // e.g. "Customer service"
  quote: string  // A short snippet from the user's text that justifies the skill.
}

type ReviewProps = {
  experienceText: string
  suggestions: SuggestedSkill[]
  onConfirm: (selectedNames: string[]) => Promise<void> | void
  backHref?: string
  profileHref?: string
  homeHref?: string
  errorMessage?: string
}

// ==========================================
// Component
// ==========================================
export default function Review({
  experienceText,
  suggestions,
  onConfirm,
  backHref = '/hustle',
  profileHref = '/profile',
  homeHref = '/dashboard',
  errorMessage,
}: ReviewProps) {
  // Skill names the user has currently selected.
  const [selected, setSelected] = useState<string[]>([])

  // True once the save succeeds; triggers the success screen.
  const [saved, setSaved] = useState(false)

  // True while the save request is in flight.
  const [busy, setBusy] = useState(false)

  // Auto-select all suggestions when they arrive.
  useEffect(() => {
    if (suggestions.length > 0) {
      setSelected(suggestions.map((s) => s.name))
    }
  }, [suggestions])

  async function confirm() {
    setBusy(true)
    try {
      await onConfirm(selected)
      setSaved(true)
    } finally {
      setBusy(false)
    }
  }

  function toggle(name: string) {
    setSelected((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    )
  }

  // ==========================================
  // Success screen
  // ==========================================
  if (saved) {
    return (
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-xl place-items-center px-5">
        <div className="w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <Icon name="check" size={32} />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-950 dark:text-white">
            Skills added to your profile
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            You confirmed {selected.length} self-reported {selected.length === 1 ? 'skill' : 'skills'} from this experience.
          </p>

          <Button className="mt-7 w-full" href={profileHref} icon="arrow">
            View my profile
          </Button>
          <Button className="mt-2 w-full" href={homeHref} kind="ghost">
            Back to home
          </Button>
        </div>
      </div>
    )
  }

  // ==========================================
  // Suggestions screen
  // ==========================================
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:px-8">

      <Link
        className="mb-6 flex items-center gap-1 text-sm font-bold text-slate-500 dark:text-slate-400"
        href={backHref}
      >
        <Icon name="back" size={18} />
        Back
      </Link>

      <PageTitle
        eyebrow="AI-ASSISTED"
        text="Choose the ones that feel true to your experience. You're always in control."
        title={
          suggestions.length === 0
            ? 'We could not find skills'
            : `We found ${suggestions.length} ${suggestions.length === 1 ? 'skill' : 'skills'}`
        }
      />

      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          FROM YOUR EXPERIENCE
        </p>
        <p className="mt-2 text-sm italic leading-6 text-slate-600 dark:text-slate-300">
          &ldquo;{experienceText}&rdquo;
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {suggestions.map((s, index) => {
          const active = selected.includes(s.name)

          return (
            <div
              aria-checked={active}
              className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition ${
                active
                  ? 'border-blue-300 bg-blue-50/60 dark:border-blue-700 dark:bg-blue-950/40'
                  : 'border-slate-200 bg-white opacity-60 dark:border-slate-700 dark:bg-slate-800'
              }`}
              key={`${s.name}-${index}`}
              onClick={() => toggle(s.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggle(s.name)
                }
              }}
              role="checkbox"
              tabIndex={0}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-md border ${
                  active
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-700'
                }`}
              >
                {active && <Icon name="check" size={15} />}
              </span>

              <span className="flex-1">
                <span className="block text-sm font-extrabold text-slate-900 dark:text-white">
                  {s.name}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                  {s.quote}
                </span>
              </span>

              <button
                aria-label={`Edit ${s.name}`}
                className="text-slate-400 dark:text-slate-500"
                onClick={(e) => {
                  e.stopPropagation()
                  // Edit flow will be added later.
                }}
                type="button"
              >
                <Icon name="edit" size={17} />
              </button>
            </div>
          )
        })}
      </div>

      {errorMessage && suggestions.length === 0 && (
        <p className="mt-4 text-sm font-bold text-red-600 dark:text-red-400" role="alert">
          {errorMessage}
        </p>
      )}

      {suggestions.length > 0 ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Skills are labelled self-reported until verified.
          </p>
          <Button
            className="sm:px-8"
            disabled={busy || selected.length === 0}
            onClick={confirm}
          >
            {busy
              ? 'Saving...'
              : `Confirm ${selected.length} ${selected.length === 1 ? 'skill' : 'skills'}`}
          </Button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try adding a bit more detail to your description next time.
          </p>
          <Button className="sm:px-8" href={backHref} kind="secondary">
            Go Back
          </Button>
        </div>
      )}
    </div>
  )
}