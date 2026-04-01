import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, LogOut, Settings, EyeOff } from 'lucide-react'
import { StealthToggle } from '@/components/StealthToggle'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener estado de stealth desde la BD
  const { data: profile } = await supabase
    .from('profiles')
    .select('stealth_mode_active')
    .eq('id', user.id)
    .single()

  const isStealthActive = profile?.stealth_mode_active || false

  return (
    <div className="flex flex-col min-h-screen bg-black w-full pb-24 pt-8 px-4 sm:px-6">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Mi Perfil</h1>

        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-xl mb-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
            <div className="w-16 h-16 rounded-full bg-black border-2 border-neon-orange flex items-center justify-center neon-glow">
              <User className="w-8 h-8 text-neon-orange" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Usuario</p>
              <p className="text-white font-medium truncate max-w-[200px]">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Toggle de Modo Sigilo */}
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isStealthActive ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-black border border-white/10 text-gray-400'}`}>
                  <EyeOff className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium text-sm">Modo Sigilo (Stealth)</span>
                  <span className="text-[10px] text-gray-500">Disfraza la app y oculta el contenido</span>
                </div>
              </div>
              <StealthToggle initialActive={isStealthActive} />
            </div>

            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-black border border-white/10 text-gray-400">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="text-white font-medium text-sm">Ajustes de Cuenta</span>
              </div>
            </button>
            
            <form action="/auth/signout" method="post" className="pt-4 border-t border-white/5">
              <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-950/20 border border-red-900/30 hover:bg-red-950/40 transition-colors text-red-400 font-medium text-sm">
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </form>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-600 mt-8">
          MasterGrow 2.0 - Versión SaaS
        </div>
      </div>
    </div>
  )
}

