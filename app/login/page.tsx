'use client'
// 'use client' tells Next.js that this is a Client Component.
// We need it because we are using React hooks (useState, useRouter) 
// and handling user interactions (clicking, typing).

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  // These variables hold the data the user types into the form.
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // NEW: State to toggle the password visibility (eye icon)
  const [showPassword, setShowPassword] = useState(false)
  
  // NEW: State for the "Remember Me" checkbox
  const [rememberMe, setRememberMe] = useState(true)
  
  // UI State variables
  const [loading, setLoading] = useState(false) // Shows "Logging in..." on the button
  const [error, setError] = useState('')        // Holds the error message if login fails
  
  const router = useRouter() // Used to navigate to the dashboard after successful login

  // ==========================================
  // 2. LOGIN LOGIC
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault() // Stop the page from reloading when the form is submitted
    setLoading(true)   // Disable the button and show loading state
    setError('')       // Clear any previous errors

    // Call Supabase to check the email and password against the database
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // If Supabase returns an error (e.g., wrong password, user not found)
    if (loginError) {
      setError(loginError.message)
      setLoading(false) // Stop loading so the user can try again
      return            // Stop the function here
    }

    // If successful, redirect the user to the dashboard
    router.push('/dashboard')
  }

  // ==========================================
  // 3. UI RENDERING
  // ==========================================
  return (
    // 'grid lg:grid-cols-2' makes a split screen on desktop, stacked on mobile
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      
      {/* --- LEFT SIDE: The Login Form --- */}
      <section className="flex flex-col px-5 py-6 sm:px-12 lg:px-16">
        
        {/* Logo that links back to the homepage */}
        <Link href="/" className="w-fit flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22"><path d="m5 6 7 13 7-13h-4l-3 6-3-6H5Z" fill="currentColor" /><path d="m8 3 4 7 4-7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-950">Vouch</span>
        </Link>
        
        {/* Form Container - centered vertically and horizontally */}
        <div className="mx-auto my-auto w-full max-w-md py-12">
          <p className="mb-2 text-sm font-bold text-blue-600">WELCOME BACK</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Log in to your account</h1>
          <p className="mt-2 text-slate-500">Use the same secure login, whichever side of Vouch you use.</p>
          
          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            
            {/* Email Input */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Email address</span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Updates the email state as you type
                required
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" 
                placeholder="you@example.com" 
              />
            </label>
            
            {/* ==========================================
                PASSWORD INPUT WITH EYE ICON
                ========================================== */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Password</span>
              <span className="relative block">
                {/* 
                  Notice the 'type' attribute: 
                  If showPassword is true, it's "text" (visible). 
                  If false, it's "password" (hidden as dots).
                */}
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Updates the password state
                  required
                  // We added 'pr-12' (padding-right) so the text doesn't overlap the eye icon
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" 
                  placeholder="At least 8 characters" 
                />
                
                {/* The Eye Icon Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} // Toggles the state
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    // Eye Slash Icon (Shown when password is visible, click to hide)
                    <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" x2="23" y1="1" y2="23"></line></svg>
                  ) : (
                    // Eye Icon (Shown when password is hidden, click to show)
                    <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </span>
            </label>
            
            {/* ==========================================
                REMEMBER ME CHECKBOX
                ========================================== */}
            <div className="flex items-center justify-between -mt-2">
              {/* Checkbox */}
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>
              
              {/* Forgot Password */}
              <button className="text-sm font-bold text-blue-600" type="button">Forgot password?</button>
            </div>

            {/* Error Message (Only shows if 'error' state is not empty) */}
            {error && <p className="text-red-600 text-sm font-bold">{error}</p>}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading} // Disables the button if we are waiting for Supabase
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
          
          {/* Link to Signup page */}
          <p className="mt-6 text-center text-sm text-slate-500">
            New to Vouch? <Link href="/signup" className="font-bold text-blue-600">Create an account</Link>
          </p>
        </div>
      </section>

      {/* --- RIGHT SIDE: The Blue Decorative Box --- */}
      {/* 'hidden lg:flex' hides this on mobile and shows it on desktop */}
      <section className="relative hidden overflow-hidden bg-blue-700 p-16 text-white lg:flex lg:flex-col lg:justify-between">
        
        {/* Background circle decoration */}
        <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full border-[70px] border-blue-600" />
        
        {/* Quote Text */}
        <div className="relative mt-24 max-w-lg">
          <p className="text-4xl font-extrabold leading-tight tracking-tight">“I already had the skills. Vouch helped me see them.”</p>
          <p className="mt-6 text-blue-100">Turn informal work, volunteering and side hustles into a profile you can be proud of.</p>
        </div>
        
        {/* Stats at the bottom */}
        <div className="relative flex gap-8 border-t border-blue-500 pt-8">
          <div><p className="text-3xl font-extrabold">1–5</p><p className="text-sm text-blue-200">day opportunities</p></div>
          <div><p className="text-3xl font-extrabold">100%</p><p className="text-sm text-blue-200">free for youth</p></div>
        </div>
      </section>
      
    </main>
  )
}