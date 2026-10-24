'use client'
// 'use client' is a Next.js directive. It tells Next.js that this page must be 
// rendered on the browser (Client Component) because it uses React hooks like 
// useState and useEffect, and it interacts with the Supabase database.

// --- IMPORTS ---
import { useEffect, useState } from 'react' 
import { useRouter } from 'next/navigation' 
import { supabase } from '@/lib/supabase' 
import Hustle, { ExperienceItem, ExperienceInput } from '@/components/Hustle'

export default function HustlePage() {
  
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  const [experiences, setExperiences] = useState<ExperienceItem[]>([])
  const [loading, setLoading] = useState(true) 
  const [saving, setSaving] = useState(false)  
  const [error, setError] = useState('')       
  const router = useRouter()

  // ==========================================
  // 2. FETCH EXISTING EXPERIENCES
  // ==========================================
  useEffect(() => {
    const loadExperiences = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', session.user.id)
        .order('created_at', { ascending: false })

      if (data) {
        const formattedData = data.map((item) => ({
          id: item.id,
          title: item.title,
          date: new Date(item.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }),
          text: item.description,
          skills: [] 
        }))
        
        setExperiences(formattedData)
      }
      
      setLoading(false)
    }
    
    loadExperiences()
  }, [router])

  // ==========================================
  // 3. SAVE A NEW EXPERIENCE
  // ==========================================
  const handleSave = async (input: ExperienceInput) => {
    setSaving(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data, error: dbError } = await supabase
      .from('experiences')
      .insert({
        profile_id: session.user.id,
        title: input.title,
        description: input.description,
        type: input.type,
      })
      .select()
      .single()

    if (dbError) {
      setError(dbError.message)
      setSaving(false)
      return
    }

    if (data) {
      router.push(`/review?id=${data.id}`)
    }
  }

  // ==========================================
  // 4. DELETE EXPERIENCE HANDLER (Person 4 Task)
  // ==========================================
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) {
      return
    }

    try {
      // Delete from Supabase database
      const { error: deleteError } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Refresh the local UI state instantly
      setExperiences((prev) => prev.filter((exp) => exp.id !== id))
    } catch (err: any) {
      console.error('Error deleting experience:', err)
      alert(err.message || 'Failed to delete experience.')
    }
  }

  // ==========================================
  // 5. EDIT EXPERIENCE HANDLER (Person 2 Task - NEW)
  // ==========================================
  // This is called when the user clicks "Save Changes" inside the Edit Modal
  const handleEdit = async (id: string, newDescription: string) => {
    setError('')

    try {
      // Update the description in Supabase
      const { error: updateError } = await supabase
        .from('experiences')
        .update({ description: newDescription })
        .eq('id', id)

      if (updateError) throw updateError

      // Instantly update the UI without reloading the page
      setExperiences((prev) => 
        prev.map((exp) => 
          exp.id === id ? { ...exp, text: newDescription } : exp
        )
      )
    } catch (err: any) {
      console.error('Error updating experience:', err)
      setError(err.message || 'Failed to update experience.')
    }
  }

  // ==========================================
  // 6. RENDER THE PAGE
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 transition-colors duration-200 pb-20">
        <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 p-4 mb-2 flex items-center transition-colors duration-200">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </nav>
        <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-2 h-4 w-64 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-7 h-24 w-full rounded-2xl bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-20">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 p-4 mb-2 transition-colors duration-200">
        <button onClick={() => router.push('/dashboard')} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer">
          ← Back to Dashboard
        </button>
      </nav>

      {/* Render Team Member's Hustle Component with BOTH onDelete and onEdit props */}
      <Hustle 
        experiences={experiences} 
        onSave={handleSave} 
        onDelete={handleDelete}
        onEdit={handleEdit} // <-- THIS IS THE NEW PROP WE ADDED
        saving={saving} 
        errorMessage={error} 
      />
      
    </div>
  )
}