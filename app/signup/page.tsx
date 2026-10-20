'use client'
// 'use client' is required because this page uses React hooks (useState, useRouter) 
// and interacts with the browser (like reading form inputs).

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  // We need to remember what the user types into the form.
  // useState creates a variable and a function to update it.
  
  const [name, setName] = useState('')               // Stores the user's full name
  const [email, setEmail] = useState('')             // Stores the user's email
  const [password, setPassword] = useState('')       // Stores the user's password
  const [country, setCountry] = useState('ZA')       // Stores country ('ZA' for South Africa, 'NA' for Namibia)
  
  const [loading, setLoading] = useState(false)      // Disables the button while creating the account
  const [error, setError] = useState('')             // Holds the error message if signup fails
  
  const router = useRouter() // Used to redirect the user to the dashboard after signup

  // ==========================================
  // 2. FORM SUBMISSION LOGIC
  // ==========================================
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault() // Stops the page from reloading when the form is submitted
    setLoading(true)   // Show "Creating account..." on the button
    setError('')       // Clear any old errors

    // We call Supabase Auth to create the user.
    // IMPORTANT: We pass full_name and country into 'options.data'.
    // The Database Trigger we just created will read this data and 
    // automatically create a row in the 'profiles' table!
    const { error: signUpError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: name,
          country: country,
        }
      }
    })

    // If Supabase returns an error (e.g., email already exists), show it and stop.
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // If successful, redirect the user to the dashboard.
    router.push('/dashboard')
  }

  // ==========================================
  // 3. UI RENDERING (The Page Layout)
  // ==========================================
  return (
    // 'grid lg:grid-cols-2' creates a split-screen layout on large screens
    // (the form on the left, the blue box on the right). On mobile, it stacks.
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      
      {/* ==========================================
          LEFT SIDE: The Signup Form
          ========================================== */}
      <section className="flex flex-col px-5 py-6 sm:px-12 lg:px-16">
        
        {/* Logo that links back to the homepage */}
        <Link href="/" className="w-fit flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22"><path d="m5 6 7 13 7-13h-4l-3 6-3-6H5Z" fill="currentColor" /><path d="m8 3 4 7 4-7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-950">Vouch</span>
        </Link>
        
        {/* Centered form container */}
        <div className="mx-auto my-auto w-full max-w-md py-12">
          <p className="mb-2 text-sm font-bold text-blue-600">JOIN VOUCH</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Create your free profile</h1>
          <p className="mt-2 text-slate-500">Show what you can do and find paid work that fits.</p>
          
          <form className="mt-8 space-y-5" onSubmit={handleSignup}>
            
            {/* 1. Full Name Input */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Full name</span>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} // Updates state on typing
                required 
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" 
                placeholder="e.g. Thabo Mokoena" 
              />
            </label>
            
            {/* 2. Email Input */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Email address</span>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" 
                placeholder="you@example.com" 
              />
            </label>

            {/* 3. Password Input */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Password</span>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength={6} // Supabase requires passwords to be at least 6 characters
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" 
                placeholder="At least 8 characters" 
              />
            </label>

            {/* 4. Country Dropdown (Required by teammate's SRS) */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Country</span>
              <select 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="ZA">South Africa (ZAR)</option>
                <option value="NA">Namibia (NAD)</option>
              </select>
            </label>

            {/* Error Message Display */}
            {error && <p className="text-red-600 text-sm font-bold">{error}</p>}
            
            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading} // Disables button while loading to prevent double-clicks
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Create my profile'}
            </button>
          </form>
          
          {/* Link to Login Page */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link href="/login" className="font-bold text-blue-600">Log in</Link>
          </p>
        </div>
      </section>

      {/* ==========================================
          RIGHT SIDE: The Blue Decorative Box
          ========================================== */}
      {/* 'hidden lg:flex' means this section is hidden on phones and only shows on desktop screens */}
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