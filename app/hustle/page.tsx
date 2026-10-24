'use client'
import { useEffect, useState } from 'react' 
import { useRouter } from 'next/navigation' 
import { supabase } from '@/lib/supabase' 
import Hustle, { ExperienceItem, ExperienceInput } from '@/components/Hustle'

export default function HustlePage() {
  
  const [experiences, setExperiences] = useState<ExperienceItem[]>([])
  const [loading, setLoading] = useState(true) 
  const [saving, setSaving] = useState(false)  
  const [error, setError] = useState('')       
  const router = useRouter()

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) {
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setExperiences((prev) => prev.filter((exp) => exp.id !== id))
    } catch (err: any) {
      console.error('Error deleting experience:', err)
      alert(err.message || 'Failed to delete experience.')
    }
  }

  const handleEdit = async (id: string, newDescription: string) => {
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('experiences')
        .update({ description: newDescription })
        .eq('id', id)

      if (updateError) throw updateError

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

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8 animate-pulse">
        <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-2 h-4 w-64 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-7 h-24 w-full rounded-2xl bg-slate-200 dark:bg-slate-700" />
      </div>
    )
  }

  return (
    <div className="pb-20">
      <Hustle 
        experiences={experiences} 
        onSave={handleSave} 
        onDelete={handleDelete}
        onEdit={handleEdit}
        saving={saving} 
        errorMessage={error} 
      />
    </div>
  )
}