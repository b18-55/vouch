'use client'
import { useEffect, useState } from 'react'

export default function FakeToast({ message }: { message: string }) {
  const [show, setShow] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  if (!show) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg z-50 animate-bounce">
      {message}
    </div>
  )
}