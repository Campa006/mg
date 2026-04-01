'use client'

import { Lightbulb, LightbulbOff } from 'lucide-react'
import { usePhotoperiod } from './providers/PhotoperiodProvider'
import { useEffect, useState } from 'react'

export function PhotoperiodToggle() {
  const { isRedMode, toggleRedMode } = usePhotoperiod()
  const [mounted, setMounted] = useState(false)

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center">
        <Lightbulb className="w-4 h-4 text-gray-500" />
      </div>
    )
  }

  return (
    <button 
      onClick={toggleRedMode}
      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 relative z-50 ${
        isRedMode 
          ? 'bg-red-950 border-red-500 text-red-500 shadow-[0_0_15px_rgba(255,0,0,0.5)]' 
          : 'bg-[#121212] border-white/10 text-gray-400 hover:text-white'
      }`}
      aria-label="Alternar Modo Fotoperíodo (Luz Roja)"
    >
      {isRedMode ? (
        <LightbulbOff className="w-4 h-4 red-mode-safe" />
      ) : (
        <Lightbulb className="w-4 h-4" />
      )}
    </button>
  )
}
