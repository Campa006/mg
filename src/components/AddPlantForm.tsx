'use client'

import { useRef, useState, useEffect } from 'react'
import { addPlant } from '@/app/actions/plantActions'
import { Plus, Sprout, Search, X } from 'lucide-react'
import { strainsLibrary, Strain, StrainType } from '@/lib/data/strains'

export function AddPlantForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para el Autocomplete
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredStrains, setFilteredStrains] = useState<Strain[]>([])
  
  // Estados de los campos que se auto-rellenan
  const [selectedType, setSelectedType] = useState<StrainType>('Feminizada')
  const [cycleDays, setCycleDays] = useState(80)

  // Filtrar cepas cuando cambia el buscador
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStrains([])
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = strainsLibrary.filter(strain => 
      strain.name.toLowerCase().includes(term)
    )
    setFilteredStrains(filtered)
  }, [searchTerm])

  // Manejar selección de una cepa de la librería
  const handleSelectStrain = (strain: Strain) => {
    setSearchTerm(strain.name)
    setSelectedType(strain.type)
    setCycleDays(strain.estimated_cycle_days)
    setShowSuggestions(false)
  }

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    // Asegurarnos de que el nombre se envía incluso si no se seleccionó del autocomplete
    if (!formData.get('name') && searchTerm) {
      formData.set('name', searchTerm)
    }
    
    const result = await addPlant(formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      formRef.current?.reset()
      setSearchTerm('')
      setSelectedType('Feminizada')
      setCycleDays(80)
    }
    
    setLoading(false)
  }

  return (
    <div className="bg-obsidian-gray border border-obsidian-light rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-visible">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-neon-orange neon-glow"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-black border border-neon-orange flex items-center justify-center neon-glow shrink-0">
          <Sprout className="w-5 h-5 text-neon-orange" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide">Nueva Planta</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-950/50 border border-red-900 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-5 pb-4">
        {/* Buscador de Genética (Autocomplete) */}
        <div className="flex flex-col gap-2 relative" onClick={(e) => e.stopPropagation()}>
          <label htmlFor="name_search" className="text-sm font-medium text-gray-400">Nombre de la Cepa</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              id="name_search"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => {
                if (searchTerm) setShowSuggestions(true)
              }}
              placeholder="Ej. Gorilla Glue o escribe manual"
              autoComplete="off"
              className="bg-black border border-obsidian-light rounded-lg pl-10 pr-10 py-3 w-full text-white placeholder-gray-600 focus:outline-none focus:border-neon-orange focus:ring-1 focus:ring-neon-orange transition-all text-base"
            />
            {/* Input oculto para que el Server Action reciba el 'name' correctamente */}
            <input type="hidden" name="name" value={searchTerm} />
            
            {searchTerm && (
              <button 
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setShowSuggestions(false)
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-500 hover:text-white" />
              </button>
            )}
          </div>

          {/* Dropdown de Sugerencias */}
          {showSuggestions && filteredStrains.length > 0 && (
            <div className="absolute z-50 w-full mt-1 top-full bg-obsidian-gray border border-obsidian-light rounded-lg shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-black/50">
                Sugerencias de la Librería
              </div>
              <ul className="divide-y divide-obsidian-light/50">
                {filteredStrains.map((strain) => (
                  <li 
                    key={strain.id}
                    onClick={() => handleSelectStrain(strain)}
                    className="px-4 py-3 hover:bg-obsidian-light cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <span className="text-white font-medium">{strain.name}</span>
                    <span className="text-xs text-neon-orange border border-neon-orange/30 bg-neon-orange/10 px-2 py-0.5 rounded">
                      {strain.type === 'Autofloreciente' ? 'Auto' : 'Fem'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="genetica" className="text-sm font-medium text-gray-400">Tipo</label>
            <select
              id="genetica"
              name="genetica"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as StrainType)}
              required
              className="bg-black border border-obsidian-light rounded-lg px-3 py-3 text-white focus:outline-none focus:border-neon-orange focus:ring-1 focus:ring-neon-orange transition-all appearance-none text-sm"
            >
              <option value="Feminizada">Feminizada</option>
              <option value="Autofloreciente">Autofloreciente</option>
              <option value="Regular">Regular</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="ciclo_total_estimado" className="text-sm font-medium text-gray-400">Ciclo (días)</label>
            <input
              id="ciclo_total_estimado"
              name="ciclo_total_estimado"
              type="number"
              value={cycleDays}
              onChange={(e) => setCycleDays(parseInt(e.target.value) || 0)}
              required
              min={30}
              max={300}
              className="bg-black border border-obsidian-light rounded-lg px-3 py-3 text-white focus:outline-none focus:border-neon-orange focus:ring-1 focus:ring-neon-orange transition-all text-sm text-center"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="fecha_inicio" className="text-sm font-medium text-gray-400">Fecha de Inicio</label>
          <input
            id="fecha_inicio"
            name="fecha_inicio"
            type="date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="bg-black border border-obsidian-light rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-orange focus:ring-1 focus:ring-neon-orange transition-all [color-scheme:dark]"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !searchTerm.trim()}
          className="mt-4 w-full bg-neon-orange hover:bg-orange-600 text-black font-bold py-3.5 px-4 rounded-lg transition-all duration-200 neon-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Plus className="w-5 h-5" />
          {loading ? 'Guardando...' : 'Añadir Planta'}
        </button>
      </form>
    </div>
  )
}

