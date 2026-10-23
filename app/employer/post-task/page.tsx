'use client'
// 'use client' tells Next.js that this page runs in the browser (Client Component).
// We need this because we use React hooks (useState, useEffect) and handle database form submissions.

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button, Icon } from '@/components/ui'

export default function PostTaskPage() {
  const router = useRouter()

  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  // Form input fields for posting a new micro-task
  const [title, setTitle] = useState('')
  const [employerName, setEmployerName] = useState('')
  const [description, setDescription] = useState('')
  const [payAmount, setPayAmount] = useState('')
  const [durationDays, setDurationDays] = useState('3')
  const [location, setLocation] = useState('Remote')

  // UI status feedback states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // ==========================================
  // 2. AUTHENTICATION CHECK ON LOAD
  // ==========================================
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  // ==========================================
  // 3. HANDLE FORM SUBMISSION TO SUPABASE
  // ==========================================
  const handlePostTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    // Insert new task into the 'micro_tasks' table in Supabase
    const { error: insertError } = await supabase
      .from('micro_tasks')
      .insert({
        profile_id: session.user.id,
        title: title,
        employer_name: employerName,
        description: description,
        pay_amount: parseFloat(payAmount) || 0,
        duration_days: parseInt(durationDays) || 1,
        location: location,
        status: 'open',
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    // Redirect back to tasks list after 1.5 seconds
    setTimeout(() => {
      router.push('/tasks')
    }, 1500)
  }

  // ==========================================
  // 4. RENDER THE UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-20">
      
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-5 lg:px-8 transition-colors duration-200">
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">
          ← Back to Dashboard
        </Link>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-2xl px-5 py-8 lg:px-8">
        
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-sm transition-colors duration-200">
          
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">
            Post a Micro-Internship Task
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create a short-term paid gig and connect with work-ready youth on Vouch.
          </p>

          {success ? (
            <div className="mt-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-6 text-center text-emerald-800 dark:text-emerald-300">
              <p className="font-bold text-lg">Task posted successfully!</p>
              <p className="text-sm mt-1">Redirecting to the opportunities board...</p>
            </div>
          ) : (
            <form onSubmit={handlePostTask} className="mt-8 space-y-6">
              
              {/* Task Title */}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Task Title</span>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  placeholder="e.g. Social Media Graphic Creator" 
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition" 
                />
              </label>

              {/* Employer / Company Name */}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Company / Employer Name</span>
                <input 
                  type="text" 
                  value={employerName} 
                  onChange={(e) => setEmployerName(e.target.value)} 
                  required 
                  placeholder="e.g. TechStart SA" 
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition" 
                />
              </label>

              {/* Grid Layout for Pay & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Total Pay (ZAR R)</span>
                  <input 
                    type="number" 
                    value={payAmount} 
                    onChange={(e) => setPayAmount(e.target.value)} 
                    required 
                    placeholder="1000" 
                    className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition" 
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Duration (Days)</span>
                  <input 
                    type="number" 
                    value={durationDays} 
                    onChange={(e) => setDurationDays(e.target.value)} 
                    required 
                    min="1"
                    className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition" 
                  />
                </label>
              </div>

              {/* Location */}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Location</span>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="e.g. Remote / Johannesburg" 
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition" 
                />
              </label>

              {/* Description */}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Task Description</span>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={4}
                  required
                  placeholder="Describe the tasks, deliverables, and expectations for the applicant..."
                  className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition" 
                />
              </label>

              {/* Error Feedback */}
              {error && (
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Posting task...' : 'Publish opportunity'}
              </Button>

            </form>
          )}

        </div>
      </main>
    </div>
  )
}