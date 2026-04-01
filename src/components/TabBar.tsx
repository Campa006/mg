'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusSquare, User, Activity, BookOpen } from 'lucide-react'

export function TabBar() {
  const pathname = usePathname()

  // Ocultar tabBar en login
  if (pathname === '/login') return null

  const tabs = [
    { name: 'Cultivos', href: '/', icon: Home },
    { name: 'Biometría', href: '/biometry', icon: Activity },
    { name: 'Nueva', href: '/add', icon: PlusSquare },
    { name: 'Diario', href: '/diary', icon: BookOpen },
    { name: 'Perfil', href: '/profile', icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-obsidian-gray/90 backdrop-blur-md border-t border-obsidian-light pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon
          
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 relative"
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-neon-orange rounded-full neon-glow"></div>
              )}
              <Icon 
                className={`w-6 h-6 transition-all duration-300 ${
                  isActive ? 'text-neon-orange drop-shadow-[0_0_8px_rgba(255,107,0,0.8)]' : 'text-gray-500'
                }`} 
              />
              <span className={`text-[10px] font-medium tracking-wider transition-colors duration-300 ${
                isActive ? 'text-white' : 'text-gray-500'
              }`}>
                {tab.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
