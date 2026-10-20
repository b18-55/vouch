'use client'
// 'use client' tells Next.js this page runs in the browser. We need this because
// we use React state, handle URL parameters, and make API requests.

import { useEffect, useState, Suspense } from 'react'
// useEffect: Runs code when the page first loads.
// useState: Stores variables that update the screen when they change.
// Suspense: A React feature required by Next.js when reading URL parameters.

import { useRouter, useSearchParams } from 'next/navigation'
// useRouter: Lets us redirect the user to different pages.
// useSearchParams: Lets us read the URL (e.g., grabbing the "123" from /review?id=123).

import { supabase } from '@/lib/supabase'
// Our secure connection to the database.

import Review, { SuggestedSkill } from '@/components/Review'
// Your teammate's beautiful UI component, and the TypeScript type for skills.

// ==========================================
// INNER COMPONENT: Handles the Logic
// ==========================================
// Next.js requires components that read from the URL to be inside a Suspense boundary.
function ReviewContent() {
  
  // 1. GRAB THE URL DATA
  const searchParams = useSearchParams()
  const experienceId = searchParams.get('id') // Extracts the ID from the URL
  const router = useRouter() // Used to redirect users

  // 2. SETUP STATE
  const [experienceText, setExperienceText] = useState('') // Holds the text the user typed
  const [suggestions, setSuggestions] = useState<SuggestedSkill[]>([]) // Holds the AI results
  const [loading, setLoading] = useState(true) // Shows "Asking AI..." while waiting
  const [error, setError] = useState('') // Holds any error messages

  // 3. FETCH DATA & CALL THE AI
  useEffect(() => {
    const loadData = async () => {
      
      // If there's no ID in the URL, kick them back to the Hustle page.
      if (!experienceId) {
        router.push('/hustle')
        return
      }

      // Check if the user is logged in.
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      // Fetch the experience text from the Supabase database.
      const { data } = await supabase
        .from('experiences')
        .select('description')
        .eq('id', experienceId) // Match the ID from the URL
        .single() // We only want one row

      if (data) {
        // --- AI INTEGRATION STARTS HERE ---
        setExperienceText(data.description) // Save the text to display it on the UI
        
        try {
          // We send a POST request to our secure backend route (/api/extract).
          // The backend has the API key, talks to Google, and sends back the skills.
          const response = await fetch('/api/extract', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json', // Telling the server we are sending JSON
            },
            body: JSON.stringify({ text: data.description }), // Sending the user's text
          })

          // Wait for the AI to reply and convert it to JSON
          const aiData = await response.json()
          
          // If the AI successfully found skills, save them to state!
          if (aiData.skills && aiData.skills.length > 0) {
            setSuggestions(aiData.skills)
          } else {
            setError('The AI could not find any skills. Try adding more detail.')
          }
        } catch (err) {
          setError('Failed to connect to the AI. Please try again.')
        }
        // --- AI INTEGRATION ENDS HERE ---

      } else {
        setError('Experience not found.')
      }
      
      // Stop the loading spinner now that everything is done.
      setLoading(false)
    }
    
    loadData()
  }, [experienceId, router]) // Dependencies: Re-runs if ID or router changes.

  // 4. SAVE CONFIRMED SKILLS TO DATABASE
  // This function is triggered when the user clicks "Confirm X skills" on the UI.
  const handleConfirm = async (selectedNames: string[]) => {
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // We have an array of strings (e.g., ["Cash handling", "Customer service"]).
    // We need to convert this into database rows.
    const skillsToInsert = selectedNames.map((name) => ({
      profile_id: session.user.id, // Link the skill to the user
      name: name,                  // The skill name (e.g., "Cash handling")
      source: 'ai',                // Mark it as an AI-generated skill
      verified: false              // The user hasn't verified it with evidence yet
    }))

    // Insert the rows into the 'skills' table in Supabase
    const { error: dbError } = await supabase
      .from('skills')
      .insert(skillsToInsert)

    // If the database throws an error, stop the UI from showing success.
    if (dbError) {
      setError(dbError.message)
      throw new Error(dbError.message) 
    }
  }

  // 5. RENDER THE UI
  // If we are still waiting for the AI, show a loading message.
  if (loading) {
    return <p className="p-8 text-center text-slate-500">Asking AI to find your skills...</p>
  }

  // Once loaded, render the teammate's UI component.
  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-20 pt-8">
      <Review 
        experienceText={experienceText} // The text the user typed
        suggestions={suggestions}        // The AI-generated skills
        onConfirm={handleConfirm}        // The save function
        errorMessage={error}             // Any errors to display
      />
    </div>
  )
}

// ==========================================
// MAIN PAGE EXPORT
// ==========================================
// Wraps the inner component in Suspense to prevent Next.js build errors.
export default function ReviewPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-slate-500">Loading page...</p>}>
      <ReviewContent />
    </Suspense>
  )
}