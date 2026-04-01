import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Leaf, AlertCircle, Crown, Settings, Lightbulb, LightbulbOff } from 'lucide-react'
import { PlantCard } from '@/components/PlantCard'
import Link from 'next/link'
import { PullToRefresh } from '@/components/PullToRefresh'
import { PhotoperiodToggle } from '@/components/PhotoperiodToggle'
import { StealthLogoTrigger } from '@/components/StealthLogoTrigger'

import { Suspense } from 'react'

// Función para calcular si el periodo de prueba ha expirado
function getTrialStatus(trialStartDate: string | null | undefined) {
  if (!trialStartDate) return { expired: true, daysLeft: 0, isValid: false }
  
  const start = new Date(trialStartDate)
  if (isNaN(start.getTime())) return { expired: true, daysLeft: 0, isValid: false }
  
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const daysLeft = 20 - diffDays
  
  return {
    expired: diffDays > 20,
    daysLeft: daysLeft > 0 ? daysLeft : 0,
    isValid: true
  }
}

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtenemos todas las plantas del usuario
  const { data: plants } = await supabase
    .from('plants')
    .select('*')
    .order('created_at', { ascending: false })

  const hasPlants = plants && plants.length > 0
  const trialStatus = plants?.[0]?.trial_start_date ? getTrialStatus(plants[0].trial_start_date) : { expired: false, daysLeft: 20, isValid: false }

  if (trialStatus.isValid && trialStatus.expired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="bg-[#121212] border border-neon-orange/50 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-md w-full neon-glow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-orange to-transparent"></div>
          <AlertCircle className="w-16 h-16 text-neon-orange mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">Periodo de prueba finalizado</h2>
          <p className="text-gray-400 mb-8">
            Han pasado más de 20 días desde que iniciaste tu cultivo. Actualiza tu suscripción para seguir gestionando tus plantas con MasterGrow 2.0.
          </p>
          <button className="bg-neon-orange text-black font-bold py-3 px-8 rounded-lg hover:bg-orange-600 transition-all duration-200 neon-glow w-full">
            Actualizar Suscripción
          </button>
        </div>
      </div>
    )
  }

  return (
    <PullToRefresh>
      <div className="min-h-screen pb-24 bg-black flex flex-col items-center">
        {/* Header Fijo con Glassmorphism */}
        <header className="w-full sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5">
          <div className="flex flex-col w-full max-w-7xl mx-auto">
            {/* Banner de Prueba (si es válido) */}
            {trialStatus.isValid && !trialStatus.expired && (
              <div className="bg-neon-orange/20 backdrop-blur-md border-b border-neon-orange/30 text-neon-orange text-xs font-bold text-center py-2">
                Prueba Gratuita: Quedan {trialStatus.daysLeft} días
              </div>
            )}

            {/* Logo y Controles */}
            <div className="flex justify-between items-center px-4 sm:px-6 py-4">
              <StealthLogoTrigger />
              
              <div className="flex items-center gap-4">
                {/* Botón de Pánico Lumínico */}
                <PhotoperiodToggle />
                
                <Link href="/profile" className="w-10 h-10 rounded-full bg-[#121212] border border-white/10 overflow-hidden border-neon-orange/50 flex items-center justify-center hover:text-white hover:border-white/30 transition-colors">
                  <Settings className="w-5 h-5 text-neon-orange" />
                </Link>
              </div>
            </div>

            {/* Filtros Rápidos (Pills) */}
            <div className="px-4 sm:px-6 pb-4 max-w-7xl mx-auto overflow-x-auto no-scrollbar flex gap-2 w-full">
              <button className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                Todas ({plants?.length || 0})
              </button>
              <button className="whitespace-nowrap px-4 py-1.5 rounded-full bg-[#121212] border border-white/10 text-gray-400 text-xs font-medium hover:text-white hover:border-white/20 transition-all">
                Germinación
              </button>
              <button className="whitespace-nowrap px-4 py-1.5 rounded-full bg-[#121212] border border-white/10 text-gray-400 text-xs font-medium hover:text-white hover:border-white/20 transition-all">
                Vegetativo
              </button>
              <button className="whitespace-nowrap px-4 py-1.5 rounded-full bg-[#121212] border border-white/10 text-gray-400 text-xs font-medium hover:text-white hover:border-white/20 transition-all flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-orange shadow-[0_0_5px_#ff6b00]"></span>
                Floración
              </button>
            </div>
          </div>
        </header>

        {/* Contenido Principal con padding horizontal en móvil */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex-1">
          <main className="w-full">
            <Suspense fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-[#121212] border border-white/10 rounded-2xl h-48 animate-pulse flex flex-col p-4">
                      <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-white/10 rounded w-1/2 mb-auto"></div>
                      <div className="h-2 bg-white/10 rounded w-full mt-auto"></div>
                    </div>
                  ))}
                </div>
              }>
                {!hasPlants ? (
                  <div className="bg-[#121212]/50 border border-white/5 border-dashed p-10 rounded-2xl flex flex-col items-center justify-center text-center mt-10">
                    <div className="w-16 h-16 rounded-full bg-black border border-white/5 flex items-center justify-center mb-4">
                      <Leaf className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Ningún cultivo activo</h3>
                    <p className="text-sm text-gray-500 max-w-[250px]">
                      Ve a la pestaña "+" para añadir tu primera genética y comenzar a monitorizar.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr">
                    {plants.map((plant) => (
                      <PlantCard key={plant.id} plant={plant} />
                    ))}
                  </div>
                )}
              </Suspense>
          </main>
        </div>
      </div>
    </PullToRefresh>
  )
}





