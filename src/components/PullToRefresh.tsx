'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [startY, setStartY] = useState(0)
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const router = useRouter()

  const MAX_PULL = 100
  const TRIGGER_PULL = 70

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY)
        setPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling) return
      
      const currentY = e.touches[0].clientY
      const distance = currentY - startY

      if (distance > 0 && window.scrollY === 0) {
        e.preventDefault() // Prevenir scroll nativo
        setPullDistance(Math.min(distance * 0.5, MAX_PULL)) // Resistencia elástica
      }
    }

    const handleTouchEnd = async () => {
      if (!pulling) return
      
      if (pullDistance > TRIGGER_PULL) {
        setRefreshing(true)
        setPullDistance(50) // Mantener el spinner visible
        
        // Simular carga y refrescar datos
        router.refresh()
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setRefreshing(false)
      }
      
      setPullDistance(0)
      setPulling(false)
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [startY, pulling, pullDistance, router])

  return (
    <div className="relative min-h-screen w-full">
      {/* Indicador de Pull to Refresh */}
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center items-center overflow-hidden z-50 transition-all duration-300 ease-out"
        style={{ 
          height: `${pullDistance}px`,
          opacity: pullDistance / MAX_PULL 
        }}
      >
        <div className={`w-8 h-8 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center shadow-lg ${refreshing ? 'animate-spin border-neon-orange text-neon-orange' : 'text-gray-400'}`}>
          <RefreshCw className="w-4 h-4" style={{ transform: `rotate(${pullDistance * 2}deg)` }} />
        </div>
      </div>

      {/* Contenido principal que se desplaza hacia abajo */}
      <div 
        className="transition-transform duration-300 ease-out"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        {children}
      </div>
    </div>
  )
}
