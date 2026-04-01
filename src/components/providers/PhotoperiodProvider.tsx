'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface PhotoperiodContextType {
  isRedMode: boolean;
  toggleRedMode: () => void;
}

const PhotoperiodContext = createContext<PhotoperiodContextType>({
  isRedMode: false,
  toggleRedMode: () => {},
})

export const usePhotoperiod = () => useContext(PhotoperiodContext)

export function PhotoperiodProvider({ children }: { children: React.ReactNode }) {
  const [isRedMode, setIsRedMode] = useState(false)

  // Cargar estado desde localStorage al montar
  useEffect(() => {
    const savedState = localStorage.getItem('mastergrow-red-mode')
    if (savedState === 'true') {
      setIsRedMode(true)
      document.documentElement.classList.add('red-mode-active')
    }
  }, [])

  const toggleRedMode = () => {
    setIsRedMode((prev) => {
      const newState = !prev
      localStorage.setItem('mastergrow-red-mode', String(newState))
      
      if (newState) {
        document.documentElement.classList.add('red-mode-active')
      } else {
        document.documentElement.classList.remove('red-mode-active')
      }
      
      return newState
    })
  }

  return (
    <PhotoperiodContext.Provider value={{ isRedMode, toggleRedMode }}>
      {children}
      
      {/* Overlay global para el modo rojo */}
      {isRedMode && (
        <div 
          className="fixed inset-0 z-[9999] pointer-events-none mix-blend-multiply"
          style={{ backgroundColor: 'rgba(255, 0, 0, 0.75)' }}
        />
      )}
    </PhotoperiodContext.Provider>
  )
}
