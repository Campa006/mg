'use client'

import { useState, useTransition } from 'react'
import { toggleStealthModeAction } from '@/app/actions/profileActions'
import { useStealth } from './providers/StealthProvider'
import { toast } from 'sonner'

export function StealthToggle({ initialActive }: { initialActive: boolean }) {
  const [isPending, startTransition] = useTransition()
  const { toggleStealthMode } = useStealth()
  const [localActive, setLocalActive] = useState(initialActive)
  
  const handleToggle = () => {
    const newValue = !localActive
    
    // Optimistic update local y en el contexto
    setLocalActive(newValue)
    toggleStealthMode(newValue)
    
    startTransition(async () => {
      const result = await toggleStealthModeAction(newValue)
      if (result?.error) {
        // Revertir si hay error
        setLocalActive(!newValue)
        toggleStealthMode(!newValue)
        toast.error(result.error)
      } else {
        toast.success(`Modo Sigilo ${newValue ? 'Activado' : 'Desactivado'}`)
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black ${
        localActive ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-gray-700'
      } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="switch"
      aria-checked={localActive}
    >
      <span className="sr-only">Activar modo sigilo</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform duration-300 ${
          localActive ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
