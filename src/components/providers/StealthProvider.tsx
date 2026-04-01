'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface StealthContextType {
  isStealthMode: boolean;
  toggleStealthMode: (value: boolean) => void;
  showFakeUI: boolean;
  setShowFakeUI: (value: boolean) => void;
}

const StealthContext = createContext<StealthContextType>({
  isStealthMode: false,
  toggleStealthMode: () => {},
  showFakeUI: false,
  setShowFakeUI: () => {},
})

export const useStealth = () => useContext(StealthContext)

export function StealthProvider({ 
  children, 
  initialStealthState = false 
}: { 
  children: React.ReactNode;
  initialStealthState?: boolean;
}) {
  const [isStealthMode, setIsStealthMode] = useState(initialStealthState)
  const [showFakeUI, setShowFakeUI] = useState(false)

  const toggleStealthMode = (value: boolean) => {
    setIsStealthMode(value)
  }

  // Efecto para cambiar meta tags dinámicamente
  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    let manifest = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
    if (!manifest) {
      manifest = document.createElement('link');
      manifest.rel = 'manifest';
      document.head.appendChild(manifest);
    }

    if (isStealthMode) {
      document.title = "Calculadora de Gastos"
      link.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📊</text></svg>";
      manifest.href = "/stealth-manifest.json";
    } else {
      document.title = "MasterGrow 2.0"
      link.href = "/favicon.ico";
      manifest.href = "/manifest.json";
    }
  }, [isStealthMode])

  return (
    <StealthContext.Provider value={{ isStealthMode, toggleStealthMode, showFakeUI, setShowFakeUI }}>
      {children}
    </StealthContext.Provider>
  )
}
