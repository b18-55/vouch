'use client'
// Client component: uses React hooks (useState, useEffect, useSearchParams)
// and makes API requests from the browser.

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Review, { SuggestedSkill } from '@/components/Review'

function ReviewContent() {
  // Extract the experience ID passed from the Hustle page via the URL
  const searchParams = useSearchParams()
  const experienceId = searchParams.get('id')
  const router = useRouter()

  const [experienceText, setExperienceText] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestedSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadingText, setLoadingText] = useState('Analyzing your work records...')

  // ==========================================
  // Rotating status messages
  // ==========================================
  // Runs only while loading is true. Rotates the message every 1.5 s
  // to keep the user engaged while the AI processes the request.
  useEffect(() => {
    if (!loading) return

    const messages = [
      'Analyzing your work records...',
      'Mapping operational execution to capabilities...',
      'Aligning with local small business requirements...',
      'Validating your professional value infrastructure...',
      'Structuring enterprise match...',
      'Finalizing your verified credential layout...',
    ]

    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % messages.length
      setLoadingText(messages[index])
    }, 1500)

    return () => clearInterval(interval)
  }, [loading])

  // ==========================================
  // Fetch data and call the AI endpoint
  // ==========================================
  useEffect(() => {
    // AbortController lets us cancel the fetch if the user leaves the page.
    const controller = new AbortController()
    let timeoutId: NodeJS.Timeout

    const loadData = async () => {
      if (!experienceId) {
        router.push('/hustle')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      // 1. Fetch the experience text using the ID from the URL
      const { data } = await supabase
        .from('experiences')
        .select('description')
        .eq('id', experienceId)
        .single()

      if (data) {
        setExperienceText(data.description)

        // Fail-safe timeout: abort the request if it takes more than 60s.
        timeoutId = setTimeout(() => controller.abort(), 60000)

        try {
          // 2. Send the text to the AI API to extract skills
          const response = await fetch('/api/extract', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Pass the access token so the backend can verify the caller.
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ text: data.description }),
            signal: controller.signal,
          })

          clearTimeout(timeoutId)
          const aiData = await response.json()

          if (aiData.skills && aiData.skills.length > 0) {
            setSuggestions(aiData.skills)
          }
        } catch (err: unknown) {
          clearTimeout(timeoutId)
          if (err instanceof Error) {
            console.error('AI extraction failed:', err.message)
          } else {
            console.error('AI extraction failed:', err)
          }
        }
      } else {
        console.error('Experience not found')
      }
      setLoading(false)
    }

    loadData()

    // Cleanup: cancel the request and timer if the component unmounts
    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [experienceId, router])

  // ==========================================
  // Save confirmed skills
  // ==========================================
  const handleConfirm = async (selectedNames: string[]) => {
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Map the selected skill names into database rows.
    // We MUST include experience_id so the database knows which experience
    // these skills belong to (enables Cascade Delete later).
    const skillsToInsert = selectedNames.map((name) => ({
      profile_id: session.user.id,
      experience_id: experienceId, // <--- THE FIX
      name,
      source: 'ai',
      verified: false,
    }))

    const { error: dbError } = await supabase
      .from('skills')
      .insert(skillsToInsert)

    if (dbError) {
      setError(dbError.message)
      throw new Error(dbError.message)
    }
  }

  // ==========================================
  // Loading UI
  // ==========================================
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] bg-[#f7f9fc] dark:bg-slate-950 px-4 py-8 md:px-8 select-none">
        
        {/* Bouncing dots */}
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-8 md:max-w-xl">
          <div className="flex items-center justify-center space-x-3 h-12">
            <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s] md:w-4 md:h-4" />
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s] md:w-4 md:h-4" />
            <div className="w-3 h-3 rounded-full bg-teal-500 animate-bounce md:w-4 md:h-4" />
          </div>

          {/* Rotating status text */}
          <div className="w-full text-center min-h-[96px] md:min-h-[120px] px-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white leading-relaxed tracking-wide sm:text-xl md:text-2xl transition-opacity duration-300">
              {loadingText}
            </h2>
          </div>

          {/* Progress bar */}
          <div className="flex items-center justify-center w-full max-w-xs mx-auto space-x-1 sm:max-w-sm md:space-x-2">
            <div className="h-1.5 flex-1 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all duration-300" />
            <div className="h-1.5 flex-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)] transition-all duration-300" />
            <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 transition-all duration-300" />
            <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 transition-all duration-300" />
            <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 transition-all duration-300" />
          </div>
        </div>

        {/* Cancel button */}
        <div className="w-full max-w-md mx-auto mt-12 md:max-w-xs">
          <button
            onClick={() => router.push('/hustle')}
            className="w-full py-3.5 px-6 rounded-xl font-bold tracking-wide text-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm active:scale-[0.98] transition-all duration-150 md:py-4 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
          >
            Cancel and go back
          </button>
        </div>
      </div>
    )
  }

  // ==========================================
  // Render Review component
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950 pb-20 pt-8">
      <Review
        experienceText={experienceText}
        suggestions={suggestions}
        onConfirm={handleConfirm}
        errorMessage={error}
      />
    </div>
  )
}

// Suspense boundary required by Next.js for components using useSearchParams.
export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-center text-slate-500 dark:text-slate-400">
          Loading page...
        </p>
      }
    >
      <ReviewContent />
    </Suspense>
  )
}