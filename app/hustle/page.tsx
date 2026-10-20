'use client'
// 'use client' is a Next.js directive. It tells Next.js that this page must be 
// rendered on the browser (Client Component) because it uses React hooks like 
// useState and useEffect, and it interacts with the Supabase database.

// --- IMPORTS ---
import { useEffect, useState } from 'react' 
// useEffect: Lets us run code when the page first loads (like fetching data).
// useState: Lets us store variables that, when changed, update the screen.

import { useRouter } from 'next/navigation' 
// Lets us redirect the user to other pages (e.g., /login or /review).

import { supabase } from '@/lib/supabase' 
// This is our secure database connection.

import Hustle, { ExperienceItem, ExperienceInput } from '@/components/Hustle'
// We import your teammate's beautiful UI component.
// We also import the TypeScript types so we know exactly what data to pass it.

export default function HustlePage() {
  
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  // These variables remember things as the user interacts with the page.
  
  // Holds the list of past experiences to display in the UI
  const [experiences, setExperiences] = useState<ExperienceItem[]>([])
  
  // Holds a true/false value. If true, we show a "Loading..." message.
  const [loading, setLoading] = useState(true) 
  
  // Holds a true/false value. If true, the "Save" button says "Saving..." and is disabled.
  const [saving, setSaving] = useState(false)  
  
  // Holds an error message if the database fails to save the data
  const [error, setError] = useState('')       
  
  // Initializes the router so we can change pages
  const router = useRouter()

  // ==========================================
  // 2. FETCH EXISTING EXPERIENCES
  // ==========================================
  // useEffect runs automatically ONCE when the page opens.
  useEffect(() => {
    const loadExperiences = async () => {
      
      // Step A: Check if the user is actually logged in.
      // We don't want random people viewing or saving experiences.
      const { data: { session } } = await supabase.auth.getSession()
      
      // If there is no active session, kick them back to the login page.
      if (!session) {
        router.push('/login')
        return
      }

      // Step B: Fetch their specific experiences from the database.
      const { data } = await supabase
        .from('experiences') // Go to the experiences table
        .select('*')         // Get all columns
        .eq('profile_id', session.user.id) // ONLY get rows where the profile_id matches the logged-in user
        .order('created_at', { ascending: false }) // Sort by newest first

      // Step C: Format the data.
      // The database gives us data in one format, but your teammate's UI expects 
      // a specific format (ExperienceItem). We map it here.
      if (data) {
        const formattedData = data.map((item) => ({
          id: item.id,
          title: item.title,
          // Convert the raw database timestamp into a readable date (e.g., "20 October 2026")
          date: new Date(item.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }),
          text: item.description,
          skills: [] // We will load the confirmed skills in a later step
        }))
        
        // Step D: Save the formatted data into our state variable so the UI updates.
        setExperiences(formattedData)
      }
      
      // Step E: We are done loading, so hide the "Loading..." text.
      setLoading(false)
    }
    
    loadExperiences()
  }, [router]) // The [router] dependency means this effect re-runs if the router changes.

  // ==========================================
  // 3. SAVE A NEW EXPERIENCE
  // ==========================================
  // This function is called when the user clicks "Save & find my skills" 
  // on your teammate's form.
  const handleSave = async (input: ExperienceInput) => {
    
    // Step A: Show "Saving..." on the button and clear any old errors.
    setSaving(true)
    setError('')

    // Step B: Double-check the user is still logged in.
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Step C: Insert the new experience into the Supabase database.
    const { data, error: dbError } = await supabase
      .from('experiences')
      .insert({
        profile_id: session.user.id, // Link it to the logged-in user
        title: input.title,
        description: input.description,
        type: input.type,
      })
      .select() // We add .select() so Supabase sends back the newly created row (including its ID).
      .single() // We expect exactly one row back.

    // Step D: Handle errors.
    // If the database rejects the insert (e.g., missing data), show the error.
    if (dbError) {
      setError(dbError.message)
      setSaving(false) // Stop the "Saving..." state
      return
    }

    // Step E: Redirect the user!
    // If the save was successful, we redirect them to the Review page.
    // We pass the new experience's ID in the URL (e.g., /review?id=123) 
    // so the Review page knows which text to analyze.
    if (data) {
      router.push(`/review?id=${data.id}`)
    }
  }

  // ==========================================
  // 4. RENDER THE PAGE
  // ==========================================
  
  // If the data is still loading, show a simple text message.
  if (loading) {
    return <p className="p-8 text-center text-slate-500">Loading your hustle...</p>
  }

  // If loading is done, render the actual page.
  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-20">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 p-4 mb-2">
        <button onClick={() => router.push('/dashboard')} className="text-sm font-bold text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </button>
      </nav>

      {/* 
        Here we render your teammate's UI component.
        We pass in all the data (experiences) and functions (handleSave) as "props".
        This is the beauty of component-based architecture: the UI is separate from the logic.
      */}
      <Hustle 
        experiences={experiences} 
        onSave={handleSave} 
        saving={saving} 
        errorMessage={error} 
      />
      
    </div>
  )
}