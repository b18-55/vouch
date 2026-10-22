'use client'
// 'use client' is a Next.js directive. It tells Next.js this component must run 
// in the browser because we use React hooks (useState, useEffect) and handle routing.

// --- IMPORTS ---
import { useEffect, useState } from 'react'
// useEffect: Runs our database fetch when the page first loads.
// useState: Holds the data so the screen updates when it arrives.

import { useRouter } from 'next/navigation'
// Lets us redirect the user to the login page if they aren't authenticated.

import Link from 'next/link'
// Next.js's fast navigation component. Used for the "Back to Dashboard" button.

import { supabase } from '@/lib/supabase'
// Our secure connection to the database.

import { Icon, PageTitle } from '@/components/ui'
// Reusable UI pieces (the briefcase icon and the page header).

// ==========================================
// 1. TYPESCRIPT TYPES
// ==========================================
// This defines the exact shape of the data we expect to get back from Supabase.
// Notice that 'micro_tasks' is nested inside. This is because we are doing 
// a relational database "Join" (pulling data from two tables at once).
type Application = {
  id: string
  status: string
  created_at: string
  micro_tasks: {
    title: string
    employer_name: string
  }
}

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function ApplicationsPage() {
  
  // --- STATE ---
  // 'applications' holds the array of jobs the user applied for. Starts empty.
  const [applications, setApplications] = useState<Application[]>([])
  
  // 'loading' hides the page until the database responds.
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()

  // ==========================================
  // 3. FETCH APPLICATIONS FROM DATABASE
  // ==========================================
  // This runs automatically when the page opens.
  useEffect(() => {
    const loadApplications = async () => {
      
      // Step A: Check if the user is logged in.
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login') // Kick them to login if not
        return
      }

      // Step B: The Database Query (This is the important part!)
      const { data, error } = await supabase
        .from('applications') // Look in the applications table
        .select(`
          id,
          status,
          created_at,
          micro_tasks (
            title,
            employer_name
          )
        `) 
        // ^ The code above is a Supabase "Join". 
        // It says: "Give me the application info, AND go look up the related job 
        // in the micro_tasks table to get its title and employer name."
        
        .eq('profile_id', session.user.id) // ONLY get rows for this specific user
        .order('created_at', { ascending: false }) // Sort by newest first

      if (data) {
        // We save the data to our state. 
        // 'as unknown as Application[]' is just a TypeScript way of saying 
        // "Trust me, this data matches our Application type structure."
        setApplications(data as unknown as Application[])
      }
      
      // Step C: Stop the loading spinner
      setLoading(false)
    }
    
    loadApplications()
  }, [router])

  // If we are still waiting for the database, show a simple text message.
  if (loading) return <p className="p-8 text-center text-slate-500">Loading your applications...</p>

  // ==========================================
  // 4. RENDER THE UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-20">
      
      {/* --- TOP NAVIGATION --- */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-black">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        
        {/* Page Title (from teammate's UI component) */}
        <PageTitle 
          title="My applications" 
          text="Keep track of your opportunities in one place." 
        />

        {/* --- CONDITIONAL RENDERING: Empty State vs List --- */}
        
        {applications.length === 0 ? (
          // STATE 1: The user hasn't applied for anything yet.
          <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
              <Icon name="briefcase" />
            </span>
            <h2 className="mt-4 font-extrabold text-slate-900">No applications yet</h2>
            <p className="mt-1 text-sm text-slate-500">Head over to the opportunities board to find your first task.</p>
            
            {/* Button to go find jobs */}
            <Link 
              href="/tasks" 
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Find opportunities
            </Link>
          </div>
        ) : (
          // STATE 2: The user has applied for jobs. Show the list.
          <div className="mt-6 space-y-4">
            
            {/* Loop through every application and create a card for it */}
            {applications.map((app) => (
              <div 
                key={app.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left sm:flex-row sm:items-center"
              >
                {/* Job Icon */}
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon name="briefcase" />
                </span>
                
                {/* Job Info (Pulled from the joined micro_tasks table) */}
                <div className="flex-1">
                  <h2 className="font-extrabold text-slate-950">
                    {app.micro_tasks.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {app.micro_tasks.employer_name} · Applied {new Date(app.created_at).toLocaleDateString('en-ZA')}
                  </p>
                </div>

                {/* Status Badge */}
                {/* This changes color based on the status in the database */}
                <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-extrabold ${
                  app.status === 'submitted' 
                    ? 'bg-amber-50 text-amber-700' // Yellow badge for 'submitted'
                    : 'bg-emerald-50 text-emerald-700' // Green badge for 'hired' or 'accepted'
                }`}>
                  {app.status === 'submitted' ? 'Submitted' : 'Accepted'}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}