'use client'
// 'use client' tells Next.js this page runs in the browser. We need this because
// we use React state, handle URL parameters, and make API requests.

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Review, { SuggestedSkill } from '@/components/Review'

function ReviewContent() {
  
  const searchParams = useSearchParams()
  const experienceId = searchParams.get('id')
  const router = useRouter() 

  const [experienceText, setExperienceText] = useState('') 
  const [suggestions, setSuggestions] = useState<SuggestedSkill[]>([]) 
  const [loading, setLoading] = useState(true) 
  
  // We still keep the error state, but ONLY for database save errors, 
  // NOT for AI extraction failures.
  const [error, setError] = useState('') 
  
  // State to hold the rotating loading text
  const [loadingText, setLoadingText] = useState('Analyzing your work records...')

  // ==========================================
  // 1. CHOREOGRAPHED TEXT ROTATION
  // ==========================================
  useEffect(() => {
    if (!loading) return
    
    const messages = [
      'Analyzing your work records...',
      'Mapping operational execution to capabilities...',
      'Aligning with local small business requirements...',
      'Validating your professional value infrastructure...',
      'Structuring enterprise match...',
      'Finalizing your verified credential layout...'
    ]
    
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % messages.length
      setLoadingText(messages[index])
    }, 1500)

    return () => clearInterval(interval)
  }, [loading])

  // ==========================================
  // 2. FETCH DATA AND CALL AI
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      
      if (!experienceId) {
        router.push('/hustle')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      const { data } = await supabase
        .from('experiences')
        .select('description')
        .eq('id', experienceId)
        .single()

      if (data) {
        setExperienceText(data.description)
        
        // 60-second timeout protection
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000)

        try {
          const response = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: data.description }),
            signal: controller.signal 
          })

          clearTimeout(timeoutId) 
          const aiData = await response.json()
          
          if (aiData.skills && aiData.skills.length > 0) {
            // Success! We found skills.
            setSuggestions(aiData.skills)
          } 
          // NOTE: If there are no skills, we do absolutely nothing. 
          // We don't set an error. The UI will just see 0 skills and show the "Go Back" button.

        } catch (err: unknown) {
          clearTimeout(timeoutId)
          
          // NOTE: Even if the AI times out or fails, we do NOT show a red error to the user.
          // We just log it to the console so developers know, and the UI naturally 
          // falls back to the "We could not find skills" empty state.
          console.error("AI Extraction failed:", err)
        }
      } else {
        // This only happens if the experience ID is completely invalid
        console.error("Experience not found")
      }
      setLoading(false)
    }
    
    loadData()
  }, [experienceId, router])

  // ==========================================
  // 3. SAVE CONFIRMED SKILLS
  // ==========================================
  const handleConfirm = async (selectedNames: string[]) => {
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const skillsToInsert = selectedNames.map((name) => ({
      profile_id: session.user.id,
      name: name, 
      source: 'ai', 
      verified: false 
    }))

    const { error: dbError } = await supabase
      .from('skills')
      .insert(skillsToInsert)

    if (dbError) {
      // This is a legitimate error that we DO want to show the user
      setError(dbError.message)
      throw new Error(dbError.message) 
    }
  }

  // ==========================================
  // 4. LOADING UI (CHOREOGRAPHED ELASTIC WAVE)
  // ==========================================
  if (loading) {
    return (
      // Using the app's light theme background for a seamless transition
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] bg-[#f7f9fc] px-4 py-8 md:px-8 select-none">
        
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-8 md:max-w-xl">
          
          {/* 1. Choreographed Elastic Wave Array */}
          <div className="flex items-center justify-center space-x-3 h-12">
            <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s] md:w-4 md:h-4"></div>
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s] md:w-4 md:h-4"></div>
            <div className="w-3 h-3 rounded-full bg-teal-500 animate-bounce md:w-4 md:h-4"></div>
          </div>

          {/* 2. Paced Text Container with min-height to prevent layout shift */}
          <div className="w-full text-center min-h-[96px] md:min-h-[120px] px-2">
            <h2 className="text-lg font-semibold text-slate-900 leading-relaxed tracking-wide sm:text-xl md:text-2xl transition-opacity duration-300">
              {loadingText}
            </h2>
          </div>

          {/* 3. Asynchronous Layout Progress Tracker */}
          <div className="flex items-center justify-center w-full max-w-xs mx-auto space-x-1 sm:max-w-sm md:space-x-2">
            <div className="h-1.5 flex-1 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all duration-300"></div>
            <div className="h-1.5 flex-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)] transition-all duration-300"></div>
            <div className="h-1.5 flex-1 rounded-full bg-slate-200 transition-all duration-300"></div>
            <div className="h-1.5 flex-1 rounded-full bg-slate-200 transition-all duration-300"></div>
            <div className="h-1.5 flex-1 rounded-full bg-slate-200 transition-all duration-300"></div>
          </div>

        </div>

        {/* 4. Bottom Control Guardrail */}
        <div className="w-full max-w-md mx-auto mt-12 md:max-w-xs">
          <button 
            onClick={() => router.push('/hustle')}
            className="w-full py-3.5 px-6 rounded-xl font-bold tracking-wide text-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm active:scale-[0.98] transition-all duration-150 md:py-4"
          >
            Cancel and go back
          </button>
        </div>

      </div>
    )
  }

  // ==========================================
  // RENDER ACTUAL REVIEW COMPONENT
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-20 pt-8">
      <Review 
        experienceText={experienceText}
        suggestions={suggestions}
        onConfirm={handleConfirm}
        errorMessage={error} // This will only ever contain database save errors now
      />
    </div>
  )
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-slate-500">Loading page...</p>}>
      <ReviewContent />
    </Suspense>
  )
}