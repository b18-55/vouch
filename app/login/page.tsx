'use client'
// 'use client' is required because this page uses React hooks (useState, useRouter).

// --- Imports ---
import { useState } from 'react'          // React hook for tracking form inputs and loading state
import { useRouter } from 'next/navigation' // Next.js router for redirecting after a successful login
import { supabase } from '@/lib/supabase'  // Our Supabase client (from lib/supabase.ts)

/**
 * Login page.
 * Authenticates the user via Supabase and redirects them to the dashboard.
 */
export default function LoginPage() {
  // --- Form field state ---
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // --- UI state ---
  const [loading, setLoading] = useState(false) // Disables the button while the request is in flight
  const [error, setError] = useState('')        // Holds the error message if login fails

  const router = useRouter() // Used to navigate to /dashboard after successful login

  /**
   * Handles form submission.
   * Flow:
   *   1. Authenticate the user via supabase.auth.signInWithPassword
   *   2. If successful, redirect to /dashboard
   *   3. If failed (wrong password, etc.), show the error message
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()        // Stop the browser from reloading the page on form submit
    setLoading(true)          // Show "Logging in…" on the button
    setError('')              // Clear any previous error

    // --- Step 1: Authenticate with Supabase ---
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // If login failed (invalid credentials, user doesn't exist), show error and stop
    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    // --- Step 2: Redirect to dashboard on success ---
    router.push('/dashboard')
  }

  // --- Render ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Welcome back</h1>

        {/* Email input 
            text-gray-900 = typed text is nearly black (high contrast)
            placeholder-gray-500 = hint text is medium grey (readable but obviously a hint) */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded mb-3 text-gray-900 placeholder-gray-500"
        />

        {/* Password input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded mb-4 text-gray-900 placeholder-gray-500"
        />

        {/* Submit button — disabled while loading to prevent double submission */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        {/* Error message (only shown if error state is not empty) */}
        {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}

        {/* Link to signup page */}
        <p className="text-center mt-6 text-sm text-gray-600">
          New here?{' '}
          <a href="/signup" className="text-blue-600 font-medium">Create an account</a>
        </p>
      </form>
    </div>
  )
}