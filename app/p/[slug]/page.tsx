'use client'
import { useEffect, useState, useRef } from 'react'
import { toPng } from 'html-to-image'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon } from '@/components/ui'

// ==========================================
// 1. TYPESCRIPT TYPES
// ==========================================
type PublicProfile = {
  id: string
  full_name: string
  location: string
  bio: string
  trust_score: number
}

type Skill = { name: string }
type Experience = { title: string, description: string }

export default function PublicProfilePage() {
  
  const params = useParams()
  const slug = params.slug as string

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const profileCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadPublicData = async () => {
      if (!slug) return
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, location, bio, trust_score')
          .eq('public_slug', slug)
          .single()

        if (profileError || !profileData) {
          setError('Profile not found. The link might be broken.')
          setLoading(false)
          return
        }

        setProfile(profileData)

        const [skillsRes, expRes] = await Promise.all([
          supabase.from('skills').select('name').eq('profile_id', profileData.id),
          supabase.from('experiences').select('title, description').eq('profile_id', profileData.id)
        ])

        if (skillsRes.data) setSkills(skillsRes.data)
        if (expRes.data) setExperiences(expRes.data)

      } catch (err) {
        setError('An error occurred loading this profile.')
      } finally {
        setLoading(false)
      }
    }
    loadPublicData()
  }, [slug])

  const downloadImage = async () => {
    if (profileCardRef.current === null) return
    try {
      const dataUrl = await toPng(profileCardRef.current, { cacheBust: true, style: { transform: 'scale(1)' } })
      const link = document.createElement('a')
      link.download = `${profile?.full_name?.replace(/\s+/g, '_') || 'vouch'}_profile.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to download image', err)
      alert('Could not download image. Try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950 py-12 px-4 animate-pulse">
         {/* Skeleton remains the same */}
      </div>
    )
  }

  if (error) return <p className="p-8 text-center text-red-500 dark:bg-slate-950 dark:text-red-400 min-h-screen">{error}</p>

  const uniqueSkills = Array.from(new Map(skills.map(s => [s.name, s])).values())

  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950 py-12 px-4 transition-colors duration-300">
      <div className="mx-auto max-w-2xl">
        
        {/* --- TOP BAR (Badge + Download Button) --- */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
            <Icon name="check" size={14} /> Verified by Vouch
          </span>
          
          <button 
            onClick={downloadImage}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition"
          >
            <span className="inline-block rotate-90">
              <Icon name="arrow" size={16} />
            </span>
            Download Image
          </button>
        </div>

        {/* --- MAIN PROFILE CARD --- */}
        <div ref={profileCardRef} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm transition-colors duration-300">
          
          <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-xl font-extrabold text-blue-700 dark:text-blue-300">
              {profile?.full_name?.slice(0, 2).toUpperCase() || 'U'}
            </div>
            
            <div>
              <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">{profile?.full_name}</h1>
              <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                <Icon name="location" size={15} /> {profile?.location || 'Location not set'}
              </p>
            </div>
            
            <div className="ml-auto text-right">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Trust Score</p>
              <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{profile?.trust_score ?? 0}/100</p>
            </div>
          </div>

          <div className="py-6">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">About</h2>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{profile?.bio || 'No bio added yet.'}</p>
          </div>

          <div className="pb-6">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Verified Skills</h2>
            <div className="flex flex-wrap gap-2">
              {uniqueSkills.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No skills added yet.</p>
              ) : (
                uniqueSkills.map((skill) => (
                  <span key={skill.name} className="rounded-xl border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 text-sm font-bold text-blue-700 dark:text-blue-300">
                    {skill.name}
                  </span>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Experience</h2>
            <div className="space-y-4">
              {experiences.map((exp, i) => (
                <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{exp.title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          This profile was created and verified on Vouch.
        </p>
      </div>
    </div>
  )
}