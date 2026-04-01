import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BiometryPanel } from '@/components/BiometryPanel'

export default async function BiometryPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user's plants to allow selecting which plant's biometry to view
  const { data: plants } = await supabase
    .from('plants')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen pb-24 bg-black flex flex-col items-center">
      <header className="w-full sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center px-4 sm:px-6 py-4 max-w-7xl mx-auto w-full">
          <h1 className="text-xl font-bold text-white tracking-tight">Biometría Global</h1>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex-1 flex flex-col gap-6">
        {!plants || plants.length === 0 ? (
          <div className="text-center p-8 bg-[#121212] border border-white/10 rounded-2xl">
            <p className="text-gray-500">Añade una planta primero para registrar datos biométricos.</p>
          </div>
        ) : (
          plants.map(plant => (
            <div key={plant.id} className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1A1A1A]">
                <h2 className="font-bold text-white text-lg">{plant.name}</h2>
                <span className="text-xs text-neon-orange bg-neon-orange/10 px-2 py-1 rounded-full border border-neon-orange/20">
                  {plant.fase_actual}
                </span>
              </div>
              <BiometryPanel plantId={plant.id} isOpenInitially={true} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}