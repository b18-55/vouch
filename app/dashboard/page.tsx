'use client'
// 'use client' is required because this page uses React hooks (useEffect, useState)
// and checks the user's session in the browser.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// TypeScript type for the profile data we fetch from the database
type Profile = {
  id: string
  full_name: string | null
  trust_score: number | null
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      // 1. Security check: Is there an active session?
      // If no session, the user isn't logged in, so we kick them back to /login
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      // 2. Fetch the profile row that matches this user's ID
      // RLS ensures they can only fetch their own profile
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, trust_score')
        .eq('id', session.user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }
    load()
  }, [router])

  // --- Logout handler ---
  const handleLogout = async () => {
    await supabase.auth.signOut() // Clear the session
    router.push('/login')         // Send them back to login
  }

  // Show a loading state while we check the session and fetch data
  if (loading) {
    return <p className="p-8 text-gray-500 font-medium">Loading your profile…</p>
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Top bar with Logout button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            Log out
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">
            Hi, {profile?.full_name || 'friend'} 👋
          </h2>
          <p className="text-gray-600 mb-6">Welcome to your Vouch dashboard.</p>
          
          {/* Trust Score Box */}
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <p className="text-sm text-blue-800 font-medium">
              Your Trust Score:
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {profile?.trust_score ?? 0}<span className="text-lg text-blue-400">/100</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Complete tasks and add evidence to raise your score.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}