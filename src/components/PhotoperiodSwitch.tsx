'use client'

import { Lightbulb, LightbulbOff } from 'lucide-react'
import { usePhotoperiod } from './providers/PhotoperiodProvider'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

export function PhotoperiodSwitch() {
  const { isRedMode, toggleRedMode } = usePhotoperiod()
  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700">
        <span className="inline-block h-4 w-4 transform rounded-full bg-black translate-x-1" />
      </div>
    )
  }

  const handleToggle = () => {
    toggleRedMode()
    startTransition(() => {
      toast.success(`Modo Fotoperíodo ${!isRedMode ? 'Activado' : 'Desactivado'}`)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2 focus:ring-offset-black ${
        isRedMode ? 'bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.5)]' : 'bg-gray-700'
      } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="switch"
      aria-checked={isRedMode}
    >
      <span className="sr-only">Activar modo fotoperíodo</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-300 ${
          isRedMode ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
