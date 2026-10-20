'use client'
// 'use client' is required because this page uses React state (useState, useEffect), 
// Next.js routing, and interacts with the Supabase database.

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Review, { SuggestedSkill } from '@/components/Review'

// ==========================================
// 1. INNER COMPONENT (Handles the Logic)
// ==========================================
// Next.js requires components that read from the URL (useSearchParams) 
// to be wrapped in a Suspense boundary. So we build the main logic here.
function ReviewContent() {
  
  // 'useSearchParams' lets us read the URL. 
  // Remember in Step 1, we redirected the user to `/review?id=123`. 
  // This line extracts that `123` so we know which experience to load.
  const searchParams = useSearchParams()
  const experienceId = searchParams.get('id') 
  
  const router = useRouter()

  // --- STATE ---
  // Holds the original text the user typed in the Hustle form
  const [experienceText, setExperienceText] = useState('')
  
  // Holds the list of skills we want to suggest to the user
  const [suggestions, setSuggestions] = useState<SuggestedSkill[]>([])
  
  // True while we are fetching data from the database
  const [loading, setLoading] = useState(true)
  
  // Holds an error message if something goes wrong
  const [error, setError] = useState('')

  // --- 1. FETCH THE EXPERIENCE TEXT ---
  // useEffect runs automatically when the page loads.
  useEffect(() => {
    const loadData = async () => {
      
      // If there is no ID in the URL, send them back to the Hustle page
      if (!experienceId) {
        router.push('/hustle')
        return
      }

      // Check if the user is logged in
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      // Fetch the description text of that specific experience from Supabase
      const { data } = await supabase
        .from('experiences')
        .select('description')
        .eq('id', experienceId) // Find the row that matches the ID in the URL
        .single() // We only expect one row back

      if (data) {
        // Save the text to state so we can show it on the screen
        setExperienceText(data.description)
        
        // ========================================================
        // TEMPORARY DUMMY DATA 
        // we will replace this block with a real call to Google AI.
        // For now, we are just faking it to prove the UI works!
        // ========================================================
        setSuggestions([
          { name: "Customer service", quote: "helped customers find products" },
          { name: "Cash handling", quote: "managed the till" },
          { name: "Stock management", quote: "counted stock at the end of each day" },
          { name: "Communication", quote: "helped customers" }
        ])
      } else {
        setError('Experience not found.')
      }
      
      // We are done loading, hide the spinner
      setLoading(false)
    }
    
    loadData()
  }, [experienceId, router])

  // --- 2. SAVE CONFIRMED SKILLS TO DATABASE ---
  // This function is called when the user clicks the "Confirm" button 
  // in your teammate's UI component.
  const handleConfirm = async (selectedNames: string[]) => {
    setError('')
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // We have an array of skill names (e.g., ["Customer service", "Cash handling"])
    // We need to format it into rows for the database.
    const skillsToInsert = selectedNames.map(name => ({
      profile_id: session.user.id, // Link to the user
      name: name,                  // The skill name
      source: 'ai',                // Mark it as AI-suggested
      verified: false              // Self-reported for now (SRS requirement)
    }))

    // Insert them into the 'skills' table in Supabase
    const { error: dbError } = await supabase
      .from('skills')
      .insert(skillsToInsert)

    // If it fails, throw an error so the UI stops trying to show the success screen
    if (dbError) {
      setError(dbError.message)
      throw new Error(dbError.message) 
    }
    
    // If it succeeds, the Review component automatically switches to the success screen!
  }

  // While loading, show a simple text message
  if (loading) return <p className="p-8 text-center text-slate-500">Finding skills...</p>

  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-20 pt-8">
      {/* We pass all the data and functions to your teammate's UI component */}
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
// 2. MAIN PAGE COMPONENT
// ==========================================
// This wraps the content in Suspense to satisfy Next.js routing requirements.
export default function ReviewPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-slate-500">Loading page...</p>}>
      <ReviewContent />
    </Suspense>
  )
}