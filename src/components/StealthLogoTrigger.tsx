'use client'

import { useState } from 'react'
import { Leaf } from 'lucide-react'
import { useStealth } from './providers/StealthProvider'

export function StealthLogoTrigger() {
  const { isStealthMode, setShowFakeUI } = useStealth()
  const [clickCount, setClickCount] = useState(0)

  const handleLogoClick = () => {
    // Solo activar si el modo sigilo está habilitado en configuración
    if (!isStealthMode) return

    setClickCount(prev => {
      const newCount = prev + 1
      if (newCount >= 3) {
        setShowFakeUI(true)
        return 0
      }
      
      // Reset contador después de 1 segundo
      setTimeout(() => setClickCount(0), 1000)
      return newCount
    })
  }

  return (
    <div 
      className="flex items-center gap-2 cursor-pointer select-none"
      onClick={handleLogoClick}
    >
      <div className="w-8 h-8 rounded-lg bg-[#121212] border border-white/10 flex items-center justify-center">
        <Leaf className="w-5 h-5 text-neon-orange drop-shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
      </div>
      <span className="text-xl font-bold text-white tracking-tight">MasterGrow</span>
    </div>
  )
}
