import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { 
  User, 
  MoreVertical, 
  Leaf, 
  Thermometer, 
  Globe, 
  Lock, 
  EyeOff, 
  Lightbulb, 
  Settings2, 
  FileText, 
  ShieldAlert, 
  MessageSquareWarning, 
  Users, 
  LogOut,
  ChevronRight
} from 'lucide-react'
import { StealthToggle } from '@/components/StealthToggle'
import { PhotoperiodSwitch } from '@/components/PhotoperiodSwitch'
import { TabBar } from '@/components/TabBar'

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
    <div className="flex flex-col min-h-screen bg-black w-full pb-24 text-white font-sans">
      
      {/* Status Bar Simulada (Opcional, pero ayuda al look) */}
      <div className="w-full flex justify-between items-center px-6 pt-4 pb-2 text-[11px] font-bold text-white tracking-wider z-50">
        <span>10:58</span>
        <div className="flex gap-1.5 items-center">
          <div className="w-4 h-3 flex items-end gap-0.5">
            <div className="w-0.5 h-1 bg-white rounded-sm"></div>
            <div className="w-0.5 h-1.5 bg-white rounded-sm"></div>
            <div className="w-0.5 h-2 bg-white rounded-sm"></div>
            <div className="w-0.5 h-3 bg-white/30 rounded-sm"></div>
          </div>
          <div className="font-medium ml-1 text-xs tracking-tighter">5G</div>
          <div className="w-5 h-2.5 border border-white/50 rounded-sm p-[1px] ml-1 flex items-center">
            <div className="h-full w-[80%] bg-white rounded-[1px]"></div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto px-4 sm:px-6 mt-4">
        
        {/* Cabecera de Usuario */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-[72px] h-[72px] rounded-full bg-[#111] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
              <User className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-xl font-semibold tracking-tight text-white mb-0.5">Inaki Campa</h2>
              <p className="text-[11px] text-gray-500 tracking-wider font-mono">
                3_XQPzv1Bdrhakeyd99098s0MQXXq2
              </p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <MoreVertical className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        <h1 className="text-2xl font-bold text-white mb-6 tracking-tight">Mi cuenta</h1>

        {/* Lista de Configuraciones */}
        <div className="flex flex-col gap-1 w-full">
          
          {/* Bloque 1: Configuraciones Básicas */}
          <div className="bg-[#121212] rounded-3xl border border-white/5 overflow-hidden shadow-xl mb-6">
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-black border border-white/5 text-neon-orange group-hover:shadow-[0_0_15px_rgba(255,107,0,0.2)] transition-shadow">
                  <Leaf className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <span className="text-[15px] font-medium text-gray-200">Plantilla de cultivo</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-neon-orange transition-colors" strokeWidth={1.5} />
            </button>
            <div className="h-[1px] w-[calc(100%-4.5rem)] bg-white/5 ml-auto"></div>

            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-black border border-white/5 text-neon-orange group-hover:shadow-[0_0_15px_rgba(255,107,0,0.2)] transition-shadow">
                  <Thermometer className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <span className="text-[15px] font-medium text-gray-200">Unidad de temperatura</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">°C</span>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-neon-orange transition-colors" strokeWidth={1.5} />
              </div>
            </button>
            <div className="h-[1px] w-[calc(100%-4.5rem)] bg-white/5 ml-auto"></div>

            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-black border border-white/5 text-neon-orange group-hover:shadow-[0_0_15px_rgba(255,107,0,0.2)] transition-shadow">
                  <Globe className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <span className="text-[15px] font-medium text-gray-200">Seleccionar idioma</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Español</span>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-neon-orange transition-colors" strokeWidth={1.5} />
              </div>
            </button>
            <div className="h-[1px] w-[calc(100%-4.5rem)] bg-white/5 ml-auto"></div>

            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-black border border-white/5 text-neon-orange group-hover:shadow-[0_0_15px_rgba(255,107,0,0.2)] transition-shadow">
                  <Lock className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <span className="text-[15px] font-medium text-gray-200">Cambiar contraseña</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-neon-orange transition-colors" strokeWidth={1.5} />
            </button>
          </div>

          {/* Bloque 2: Módulos Especiales (Switches) */}
          <div className="bg-[#121212] rounded-3xl border border-white/5 overflow-hidden shadow-xl mb-6">
            
            <div className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-black border border-white/5 text-neon-orange shadow-[0_0_15px_rgba(255,107,0,0.1)]">
                  <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[15px] font-medium text-gray-200 mb-0.5">Modo Sigilo (Stealth)</span>
                  <span className="text-[11px] text-gray-500">Disfraza la app y oculta el contenido</span>
                </div>
              </div>
              <StealthToggle initialActive={isStealthActive} />
            </div>
            <div className="h-[1px] w-[calc(100%-4.5rem)] bg-white/5 ml-auto"></div>

            <div className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-black border border-white/5 text-red-500 shadow-[0_0_15px_rgba(255,0,0,0.1)]">
                  <Lightbulb className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[15px] font-medium text-gray-200 mb-0.5">Modo Fotoperíodo (Seguridad Roja)</span>
                  <span className="text-[11px] text-gray-500">Filtro rojo persistente para protección lumínica</span>
                </div>
              </div>
              <PhotoperiodSwitch />
            </div>

          </div>

          {/* Bloque 3: Continuación de la Lista */}
          <div className="bg-[#121212] rounded-3xl border border-white/5 overflow-hidden shadow-xl mb-6">
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-black border border-white/5 text-neon-orange group-hover:shadow-[0_0_15px_rgba(255,107,0,0.2)] transition-shadow">
                  <Settings2 className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <span className="text-[15px] font-medium text-gray-200">Versión</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">V2.12.0</span>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-neon-orange transition-colors" strokeWidth={1.5} />
              </div>
            </button>
            <div className="h-[1px] w-[calc(100%-4.5rem)] bg-white/5 ml-auto"></div>

            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-black border border-white/5 text-neon-orange group-hover:shadow-[0_0_15px_rgba(255,107,0,0.2)] transition-shadow">
                  <FileText className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <span className="text-[15px] font-medium text-gray-200">Acuerdo de usuario</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-neon-orange transition-colors" strokeWidth={1.5} />
            </button>
            <div className="h-[1px] w-[calc(100%-4.5rem)] bg-white/5 ml-auto"></div>

            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-black border border-white/5 text-neon-orange group-hover:shadow-[0_0_15px_rgba(255,107,0,0.2)] transition-shadow">
                  <ShieldAlert className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <span className="text-[15px] font-medium text-gray-200">Política de privacidad</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-neon-orange transition-colors" strokeWidth={1.5} />
            </button>
            <div className="h-[1px] w-[calc(100%-4.5rem)] bg-white/5 ml-auto"></div>

            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-black border border-white/5 text-neon-orange group-hover:shadow-[0_0_15px_rgba(255,107,0,0.2)] transition-shadow">
                  <MessageSquareWarning className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <span className="text-[15px] font-medium text-gray-200">Comentarios del problema</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-neon-orange transition-colors" strokeWidth={1.5} />
            </button>
            <div className="h-[1px] w-[calc(100%-4.5rem)] bg-white/5 ml-auto"></div>

            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-black border border-white/5 text-neon-orange group-hover:shadow-[0_0_15px_rgba(255,107,0,0.2)] transition-shadow">
                  <Users className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <span className="text-[15px] font-medium text-gray-200">Sobre nosotros</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-neon-orange transition-colors" strokeWidth={1.5} />
            </button>
          </div>

          {/* Botón Cerrar Sesión */}
          <form action="/auth/signout" method="post" className="mb-12">
            <button className="w-full flex items-center justify-center gap-3 p-4 rounded-3xl bg-red-950/10 border border-red-900/30 hover:bg-red-950/30 hover:border-red-500/50 transition-all text-red-500 shadow-[0_0_20px_rgba(255,0,0,0.05)] group">
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2} />
              <span className="font-bold text-[15px] tracking-wide">Cerrar Sesión</span>
            </button>
          </form>

        </div>
      </div>
      
      {/* Navegación Inferior */}
      <TabBar />
    </div>
  )
}