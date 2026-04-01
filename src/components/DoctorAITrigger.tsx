'use client'

import { useState } from 'react'
import { Activity } from 'lucide-react'
import { DoctorAIModal } from '@/components/DoctorAIModal'

export function DoctorAITrigger({ plantId }: { plantId: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-neon-orange/10 border border-neon-orange/30 flex items-center justify-center text-neon-orange hover:bg-neon-orange hover:text-black transition-colors z-20"
        aria-label="Doctor AI"
      >
        <Activity className="w-5 h-5 sm:w-4 sm:h-4" />
      </button>
      <DoctorAIModal 
        plantId={plantId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}