'use client'
// 'use client' is required because this page uses React hooks (useState, useRouter).
// Without it, Next.js would treat this as a Server Component and hooks would fail.

// --- Imports ---
import { useState } from 'react'          // React hook for component state
import { useRouter } from 'next/navigation' // Next.js router for redirecting after signup
import { supabase } from '@/lib/supabase'  // Our Supabase client (from lib/supabase.ts)

/**
 * Signup page.
 * Creates a Supabase Auth user, then creates a matching profile row.
 * Redirects to /dashboard on success.
 */
export default function SignupPage() {
  // --- Form field state ---
  const [name, setName] = useState('')         // User's full name (stored in profiles.full_name)
  const [email, setEmail] = useState('')       // User's email (used for login)
  const [password, setPassword] = useState('') // User's password (min 6 chars — Supabase requirement)

  // --- UI state ---
  const [loading, setLoading] = useState(false) // Disables the button while the request is in flight
  const [error, setError] = useState('')        // Holds the error message if signup fails

  const router = useRouter() // Used to navigate to /dashboard after successful signup

  /**
   * Handles form submission.
   * Flow:
   *   1. Create the auth user via supabase.auth.signUp
   *   2. Create the profile row via profiles.insert (RLS allows because user is signed in)
   *   3. Redirect to /dashboard
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()        // Stop the browser from reloading the page on form submit
    setLoading(true)          // Show "Creating account…" on the button
    setError('')              // Clear any previous error

    // --- Step 1: Create the auth user ---
    // Requires email confirmation to be OFF in Supabase (Authentication → Providers → Email)
    // Otherwise no session is returned, and the profile insert in Step 2 will fail on RLS.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    // If auth creation failed (e.g. user already exists, weak password), show the error and stop
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // --- Step 2: Create the profile row ---
    // profiles.id must match auth.users.id (this is how RLS links the two).
    // The insert succeeds because the policy "Users insert own profile" requires auth.uid() = id,
    // and the user is signed in at this point.
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, full_name: name })

      // If the profile insert failed (e.g. RLS, network), show the error and stop
      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
    }

    // --- Step 3: Redirect to dashboard ---
    router.push('/dashboard')
  }

  // --- Render ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-900">Join Vouch</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Turn your hustle into verified skills.
        </p>

        {/* Full name input
            text-gray-900 = typed text is nearly black (high contrast)
            placeholder-gray-500 = hint text is medium grey (readable but obviously a hint) */}
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded mb-3 text-gray-900 placeholder-gray-500"
        />

        {/* Email input */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded mb-3 text-gray-900 placeholder-gray-500"
        />

        {/* Password input — min 6 chars because Supabase enforces this by default */}
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full p-3 border border-gray-300 rounded mb-4 text-gray-900 placeholder-gray-500"
        />

        {/* Submit button — disabled while loading to prevent double submission */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Sign up'}
        </button>

        {/* Error message (only shown if error state is not empty) */}
        {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}

        {/* Link to login page */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 font-medium">Log in</a>
        </p>
      </form>
    </div>
  )
}