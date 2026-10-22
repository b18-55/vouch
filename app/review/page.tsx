'use client'
// 'use client' tells Next.js this component runs in the browser. 
// We need this because we use React hooks (useState, useEffect, useSearchParams) 
// and make API requests to our backend.

import { useEffect, useState, Suspense } from 'react'
// useEffect: Runs code when the page loads or when variables change.
// useState: Holds variables that update the screen when they change.
// Suspense: A React feature required by Next.js when reading URL parameters.

import { useRouter, useSearchParams } from 'next/navigation'
// useRouter: Lets us redirect the user.
// useSearchParams: Lets us read the URL (e.g., grabbing the "123" from /review?id=123).

import { supabase } from '@/lib/supabase'
import Review, { SuggestedSkill } from '@/components/Review'

function ReviewContent() {
  
  // --- 1. URL PARSING ---
  // We extract the experience ID from the URL so we know which text to analyze.
  const searchParams = useSearchParams()
  const experienceId = searchParams.get('id')
  const router = useRouter() 

  // --- 2. STATE MANAGEMENT ---
  const [experienceText, setExperienceText] = useState('') // The user's original text
  const [suggestions, setSuggestions] = useState<SuggestedSkill[]>([]) // The AI's response
  const [loading, setLoading] = useState(true) // Shows the loading screen
  const [error, setError] = useState('') // Only for database errors now
  
  // This state holds the rotating text on the loading screen.
  const [loadingText, setLoadingText] = useState('Analyzing your work records...')

  // ==========================================
  // 3. CHOREOGRAPHED TEXT ROTATION
  // ==========================================
  // This effect runs ONLY while 'loading' is true. 
  // It rotates the loading text every 1.5 seconds to make the wait feel shorter.
  useEffect(() => {
    if (!loading) return // If we are done loading, stop the rotation.
    
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

    // Cleanup: If the component unmounts, stop the interval so it doesn't run forever.
    return () => clearInterval(interval)
  }, [loading])

  // ==========================================
  // 4. FETCH DATA AND CALL AI
  // ==========================================
  useEffect(() => {
    // THE CRITICAL FIX: We define the AbortController OUTSIDE the async function.
    // An AbortController is a built-in browser tool that lets us cancel a fetch request.
    const controller = new AbortController()
    
    // We declare timeoutId here so the cleanup function at the bottom can access it.
    let timeoutId: NodeJS.Timeout

    const loadData = async () => {
      
      // If there's no ID in the URL, kick them back to the Hustle page.
      if (!experienceId) {
        router.push('/hustle')
        return
      }

      // Check if the user is logged in.
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      // Fetch the original text from the database.
      const { data } = await supabase
        .from('experiences')
        .select('description')
        .eq('id', experienceId)
        .single()

      if (data) {
        setExperienceText(data.description)
        
        // Start a 60-second timer. If the AI takes longer than 60s, 
        // it will trigger the controller.abort() command.
        timeoutId = setTimeout(() => controller.abort(), 60000)

        try {
          // Call our backend API route.
          const response = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: data.description }),
            signal: controller.signal // Attach the controller so we can cancel this fetch
          })

          // If the fetch succeeds, cancel the 60-second timer so it doesn't fire later.
          clearTimeout(timeoutId) 
          
          const aiData = await response.json()
          
          if (aiData.skills && aiData.skills.length > 0) {
            setSuggestions(aiData.skills)
          } 

        } catch (err: unknown) {
          // If the fetch fails (network error or timeout), clear the timer.
          clearTimeout(timeoutId)
          
          // We use 'unknown' instead of 'any' to satisfy TypeScript.
          // We then check if it's an Error object before logging it.
          if (err instanceof Error) {
            console.error("AI Extraction failed:", err.message)
          } else {
            console.error("AI Extraction failed:", err)
          }
        }
      } else {
        console.error("Experience not found")
      }
      setLoading(false)
    }
    
    loadData()

    // ==========================================
    // 5. THE CLEANUP FUNCTION (Prevents the AbortError)
    // ==========================================
    // React runs this function automatically if the user leaves the page
    // (e.g., clicks "View Profile" or presses the back button) BEFORE the fetch finishes.
    return () => {
      clearTimeout(timeoutId) // Stop the 60-second timer
      controller.abort()      // Cancel the fetch request immediately
    }
  }, [experienceId, router]) // This effect re-runs if the ID in the URL changes.

  // ==========================================
  // 6. SAVE CONFIRMED SKILLS
  // ==========================================
  const handleConfirm = async (selectedNames: string[]) => {
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Format the skills for the database.
    const skillsToInsert = selectedNames.map((name) => ({
      profile_id: session.user.id,
      name: name, 
      source: 'ai', 
      verified: false 
    }))

    // Insert them into the 'skills' table.
    const { error: dbError } = await supabase
      .from('skills')
      .insert(skillsToInsert)

    if (dbError) {
      setError(dbError.message)
      throw new Error(dbError.message) 
    }
  }

  // ==========================================
  // 7. LOADING UI (CHOREOGRAPHED ELASTIC WAVE)
  // ==========================================
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] bg-[#f7f9fc] px-4 py-8 md:px-8 select-none">
        
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-8 md:max-w-xl">
          
          {/* The 3 bouncing dots */}
          <div className="flex items-center justify-center space-x-3 h-12">
            <div className="w-3 h-3 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s] md:w-4 md:h-4"></div>
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s] md:w-4 md:h-4"></div>
            <div className="w-3 h-3 rounded-full bg-teal-500 animate-bounce md:w-4 md:h-4"></div>
          </div>

          {/* The rotating text */}
          <div className="w-full text-center min-h-[96px] md:min-h-[120px] px-2">
            <h2 className="text-lg font-semibold text-slate-900 leading-relaxed tracking-wide sm:text-xl md:text-2xl transition-opacity duration-300">
              {loadingText}
            </h2>
          </div>

          {/* The progress bar */}
          <div className="flex items-center justify-center w-full max-w-xs mx-auto space-x-1 sm:max-w-sm md:space-x-2">
            <div className="h-1.5 flex-1 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)] transition-all duration-300"></div>
            <div className="h-1.5 flex-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)] transition-all duration-300"></div>
            <div className="h-1.5 flex-1 rounded-full bg-slate-200 transition-all duration-300"></div>
            <div className="h-1.5 flex-1 rounded-full bg-slate-200 transition-all duration-300"></div>
            <div className="h-1.5 flex-1 rounded-full bg-slate-200 transition-all duration-300"></div>
          </div>

        </div>

        {/* The cancel button */}
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
  // 8. RENDER ACTUAL REVIEW COMPONENT
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-20 pt-8">
      <Review 
        experienceText={experienceText}
        suggestions={suggestions}
        onConfirm={handleConfirm}
        errorMessage={error}
      />
    </div>
  )
}

// ==========================================
// 9. MAIN PAGE WRAPPER
// ==========================================
// Next.js requires components that use 'useSearchParams' to be wrapped in a Suspense boundary.
// This prevents the entire page from crashing during server-side rendering.
export default function ReviewPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-slate-500">Loading page...</p>}>
      <ReviewContent />
    </Suspense>
  )
}