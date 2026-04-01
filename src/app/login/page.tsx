import { login, signup } from './actions'
import { Leaf } from 'lucide-react'

export default async function LoginPage(props: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const searchParams = await props.searchParams

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-obsidian-gray border border-obsidian-light shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-neon-orange neon-glow"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-obsidian-light border border-neon-orange flex items-center justify-center mb-4 neon-glow">
            <Leaf className="w-8 h-8 text-neon-orange" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">MasterGrow <span className="text-neon-orange neon-text-glow">2.0</span></h1>
          <p className="text-sm text-gray-400 mt-2">Cultivo Profesional SaaS</p>
        </div>

        {searchParams?.message && (
          <div className={`p-4 mb-6 rounded-lg text-sm text-center ${searchParams.error ? 'bg-red-950/50 text-red-400 border border-red-900' : 'bg-green-950/50 text-green-400 border border-green-900'}`}>
            {searchParams.message}
          </div>
        )}

        <form className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              className="bg-black border border-obsidian-light rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-orange focus:ring-1 focus:ring-neon-orange transition-all"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="bg-black border border-obsidian-light rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-orange focus:ring-1 focus:ring-neon-orange transition-all"
            />
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              formAction={login}
              className="w-full bg-neon-orange hover:bg-orange-600 text-black font-bold py-3 px-4 rounded-lg transition-all duration-200 neon-glow"
            >
              Iniciar Sesión
            </button>
            <button
              formAction={signup}
              className="w-full bg-transparent hover:bg-obsidian-light border border-obsidian-light text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
            >
              Crear Cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
