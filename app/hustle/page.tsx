'use client'
// 'use client' is required because this page uses React hooks (useState, useEffect)
// and handles click events (save, delete, edit).

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Hustle, { ExperienceItem, ExperienceInput } from '@/components/Hustle'

export default function HustlePage() {
  
  // --- STATE ---
  // `experiences` holds the list rendered on the page.
  // `loading` shows the skeleton while data is fetched.
  // `saving` disables the save button while the AI is working.
  // `error` shows a message if a database operation fails.
  const [experiences, setExperiences] = useState<ExperienceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // --- LOAD EXPERIENCES ON MOUNT ---
  // Runs once when the page loads. Redirects to /login if the user isn't
  // authenticated, otherwise fetches all their experiences from Supabase.
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
        // Format the raw database rows into the shape the Hustle component expects.
        // - `date` is reformatted for display (e.g. "18 October 2026").
        // - `text` is renamed from `description` to match ExperienceItem.
        // - `skills` is left empty here because skills are loaded separately
        //   on the /profile page (this page only shows the experience card).
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

  // --- CREATE NEW EXPERIENCE ---
  // Called when the user submits the "Log experience" form.
  const handleSave = async (input: ExperienceInput) => {
    setSaving(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // We use .select().single() so Supabase returns the newly created row.
    // We need the new row's ID to redirect the user to /review?id=<the id>.
    // Without this, we'd have no way to pass the ID to the review page.
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
      // Redirect to the review page, passing the new experience's ID in the URL.
      // The review page reads this ID, calls the AI to extract skills, and
      // saves those skills with `experience_id` pointing back to this experience.
      router.push(`/review?id=${data.id}`)
    }
  }

  // --- DELETE EXPERIENCE ---
  // Called when the user clicks the delete icon on an experience card.
  const handleDelete = async (id: string) => {
    // 1. Ask for confirmation before doing anything destructive
    if (!window.confirm('Are you sure you want to delete this experience?')) {
      return
    }

    try {
      // 2. Delete the experience itself
      const { error: deleteError } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // 3. BELT-AND-SUSPENDERS: Also delete the linked skills.
      //
      // Why this explicit delete exists when we have ON DELETE CASCADE:
      //
      // - Cascade SHOULD handle this automatically. The skills table has a
      //   foreign key to experiences(id) with ON DELETE CASCADE, so when an
      //   experience is deleted, all linked skills should disappear too.
      //
      // - But cascade ONLY fires if the foreign key constraint is actually
      //   in place. If the constraint is missing (e.g. the SQL migration
      //   didn't run on this environment) or misconfigured (ON DELETE NO ACTION
      //   instead of CASCADE), skills stay behind as orphans — they have an
      //   experience_id that points to nothing.
      //
      // - We hit exactly this bug on the live Vercel deployment: deleting
      //   an experience left its skills on the profile page. Cascade wasn't
      //   firing for reasons we couldn't confirm without direct DB access.
      //
      // - Deleting here explicitly guarantees cleanup regardless of the
      //   database constraint state. If cascade IS working, this call
      //   matches 0 rows (the skills were already deleted) and does nothing.
      //   If cascade is NOT working, this call removes them.
      //
      // - The cost is one extra query per delete. The benefit is that the
      //   profile page never shows phantom skills — critical for the demo.
      await supabase
        .from('skills')
        .delete()
        .eq('experience_id', id)

      // 4. Update the local UI state so the card disappears instantly
      //    without needing a page refresh
      setExperiences((prev) => prev.filter((exp) => exp.id !== id))

    } catch (err: any) {
      console.error('Error deleting experience:', err)
      alert(err.message || 'Failed to delete experience.')
    }
  }

  // --- EDIT EXPERIENCE ---
  // Called when the user saves changes to an existing experience's description.
  const handleEdit = async (id: string, newDescription: string) => {
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('experiences')
        .update({ description: newDescription })
        .eq('id', id)

      if (updateError) throw updateError

      // Update the local state so the UI reflects the new text immediately,
      // without waiting for a full page refresh.
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

  // --- LOADING STATE ---
  // Renders a pulsing skeleton while the initial fetch is in progress.
  // Matches the shape of the real page so it feels seamless when data loads.
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