'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
// Added Icon import
import { Icon } from '@/components/ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <main className="grid min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200 lg:grid-cols-2">
      
      {/* Left Side: Login Form */}
      <section className="flex flex-col px-5 py-6 sm:px-12 lg:px-16 dark:bg-slate-900">
        
        <Link href="/" className="w-fit flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
            <svg fill="none" height="22" viewBox="0 0 24 24" width="22"><path d="m5 6 7 13 7-13h-4l-3 6-3-6H5Z" fill="currentColor" /><path d="m8 3 4 7 4-7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">Vouch</span>
        </Link>
        
        <div className="mx-auto my-auto w-full max-w-md py-12">
          <p className="mb-2 text-sm font-bold text-blue-600 dark:text-blue-400">WELCOME BACK</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Log in to your account</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Use the same secure login, whichever side of Vouch you use.</p>
          
          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            
            {/* Email Input with Icon */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Email address</span>
              <span className="relative block">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <Icon name="mail" size={18} />
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                  // Added pl-10 to accommodate the icon
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50" 
                  placeholder="name@company.com" 
                />
              </span>
            </label>
            
            {/* Password Input with Icon */}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Password</span>
              <span className="relative block">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <Icon name="lock" size={18} />
                </span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                  // Added pl-10 to accommodate the icon
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-12 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50" 
                  placeholder="At least 8 characters" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  {showPassword ? (
                    <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" x2="23" y1="1" y2="23"></line></svg>
                  ) : (
                    <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </span>
            </label>
            
            <div className="flex items-center justify-between -mt-2">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-800"
                />
                Remember me
              </label>
              
              <button 
                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors" 
                type="button"
                onClick={() => alert("Please contact support@vouch.app to reset your password.")}
              >
                Forgot password?
              </button>
            </div>

            {error && <p className="text-red-600 dark:text-red-400 text-sm font-bold">{error}</p>}

            <button 
              type="submit" 
              disabled={loading} 
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            New to Vouch? <Link href="/signup" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">Create an account</Link>
          </p>
        </div>
      </section>

      {/* Right Side: Decorative Box */}
      <section className="relative hidden overflow-hidden bg-blue-700 p-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full border-[70px] border-blue-600" />
        <div className="relative mt-24 max-w-lg">
          <p className="text-4xl font-extrabold leading-tight tracking-tight">“I already had the skills. Vouch helped me see them.”</p>
          <p className="mt-6 text-blue-100">Turn informal work, volunteering and side hustles into a profile you can be proud of.</p>
        </div>
        <div className="relative flex gap-8 border-t border-blue-500 pt-8">
          <div><p className="text-3xl font-extrabold">1–5</p><p className="text-sm text-blue-200">day opportunities</p></div>
          <div><p className="text-3xl font-extrabold">100%</p><p className="text-sm text-blue-200">free for youth</p></div>
        </div>
      </section>
      
    </main>
  )
}