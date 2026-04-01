'use client'

import { useState, useTransition } from 'react'
import { Calendar, Settings2, X, Info, Trash2, Loader2, Target } from 'lucide-react'
import { updatePlantDates, deletePlant } from '@/app/actions/plantActions'
import { toast } from 'sonner'

interface PlantCardProps {
  plant: {
    id: string
    name: string
    genetica: string
    fecha_inicio: string
    ciclo_total_estimado: number
    fase_actual: string
  }
}

export function PlantCard({ plant }: PlantCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, startTransition] = useTransition()

  // Lógica de Fechas
  const start = new Date(plant.fecha_inicio)
  const today = new Date()
  
  start.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  const diffTime = today.getTime() - start.getTime()
  const dayOfLife = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1)
  
  const total = plant.ciclo_total_estimado
  const vegetativeEndDay = Math.floor(total * 0.4)
  const daysLeft = Math.max(0, total - dayOfLife)
  
  // Hitos Críticos (Fechas)
  const addDays = (date: Date, days: number) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  const dateCambio = addDays(start, vegetativeEndDay)
  const dateLavado = addDays(start, total - 10)
  const dateCosecha = addDays(start, total)
  
  let currentColor = ''
  let currentPhaseName = ''
  
  if (dayOfLife <= 7) {
    currentColor = '#FFBF00' // Amarillo Ámbar
    currentPhaseName = 'Germinación'
  } else if (dayOfLife <= vegetativeEndDay) {
    currentColor = '#50C878' // Verde Esmeralda
    currentPhaseName = 'Vegetativo'
  } else if (dayOfLife <= total) {
    currentColor = '#FF5F1F' // Naranja Neón
    currentPhaseName = 'Floración'
  } else {
    currentColor = '#FF5F1F'
    currentPhaseName = 'Cosecha'
  }

  const germPercent = (7 / total) * 100
  const vegPercent = ((vegetativeEndDay - 7) / total) * 100
  const flowPercent = ((total - vegetativeEndDay) / total) * 100
  const currentPercent = Math.min(100, (dayOfLife / total) * 100)

  async function handleUpdate(formData: FormData) {
    setLoading(true)
    await updatePlantDates(plant.id, formData)
    setIsEditing(false)
    setLoading(false)
  }

  const tooltips = {
    germ: "Días 1-7: Mantén humedad 70-80% y luz suave. No fertilizar.",
    veg: `Días 8-${vegetativeEndDay}: Humedad 50-60%. Nitrógeno alto. Poda opcional.`,
    flow: `Días ${vegetativeEndDay + 1}-${total}: Humedad 40-50%. Fósforo y Potasio altos.`
  }

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deletePlant(plant.id)
      if (result.success) {
        toast.success('Planta eliminada con éxito')
        setIsDeleteModalOpen(false)
      } else {
        toast.error(result.error || 'Error al eliminar la planta')
      }
    })
  }

  // Parámetros Ideales por Fase
  const getIdealParams = (fase: string) => {
    switch (fase.toLowerCase()) {
      case 'germinación':
        return { temp: '22-26', hum: '70-80', vpd: '0.4-0.6', ph: '5.8', ec: '0.4', ppfd: '100-300' }
      case 'floración':
        return { temp: '20-26', hum: '40-50', vpd: '1.2-1.5', ph: '6.2', ec: '1.8-2.2', ppfd: '600-1000' }
      case 'vegetativo':
      default:
        return { temp: '22-28', hum: '60-70', vpd: '0.8-1.0', ph: '6.0', ec: '1.2-1.6', ppfd: '300-600' }
    }
  }

  const idealParams = getIdealParams(plant.fase_actual)

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-xl hover:border-white/20 transition-colors duration-300 flex flex-col h-full relative overflow-hidden group">
      <div 
        className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"
        style={{ backgroundColor: currentColor }}
      ></div>

      {/* Cabecera */}
      <div className="flex justify-between items-start mb-3 p-4 pb-0 z-10">
        <div className="flex flex-col pr-2">
          <h3 className="text-base font-bold text-white leading-tight line-clamp-1">{plant.name}</h3>
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">
            {plant.genetica}
          </span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors z-20"
            aria-label="Ajustes de planta"
          >
            <Settings2 className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
          <div 
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-black shadow-lg ${currentPhaseName === 'Floración' || currentPhaseName === 'Cosecha' ? 'neon-glow' : ''}`}
            style={{ borderColor: currentColor, color: currentColor, boxShadow: `0 0 8px ${currentColor}33` }}
          >
            <span className="text-xs font-bold">{dayOfLife}</span>
          </div>
        </div>
      </div>

      {/* Editor Modal Overlay (In-Card) */}
      {isEditing && (
        <div className="absolute inset-0 z-50 bg-[#121212]/95 backdrop-blur-sm p-4 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-white">Ajustar Cronos</h4>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-gray-500 hover:text-red-500 transition-colors p-1"
                aria-label="Eliminar planta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <form action={handleUpdate} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Fecha Inicio</label>
              <input 
                type="date" 
                name="fecha_inicio" 
                defaultValue={plant.fecha_inicio}
                className="bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white [color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Ciclo Total (días)</label>
              <input 
                type="number" 
                name="ciclo_total_estimado" 
                defaultValue={plant.ciclo_total_estimado}
                className="bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 bg-neon-orange text-black font-bold text-xs py-2 rounded shadow-[0_0_10px_rgba(255,107,0,0.3)]"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>
      )}

      {/* Hitos Críticos (Cerebro Cronos 2.0) */}
      <div className="grid grid-cols-3 gap-1 mb-2 mt-2 mx-4 z-10 bg-black/40 rounded-lg p-2 border border-white/5">
        <div className="flex flex-col items-center text-center">
          <span className="text-[9px] text-gray-500 uppercase tracking-tighter">Pre-Flora</span>
          <span className="text-xs font-semibold text-gray-300">{dateCambio}</span>
        </div>
        <div className="flex flex-col items-center text-center border-x border-white/5">
          <span className="text-[9px] text-gray-500 uppercase tracking-tighter">Lavado</span>
          <span className="text-xs font-semibold text-gray-300">{dateLavado}</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-[9px] text-neon-orange uppercase tracking-tighter">Cosecha</span>
          <span className="text-xs font-bold text-white">{dateCosecha}</span>
        </div>
      </div>

      <div className="flex-grow"></div>

      {/* Contador Regresivo */}
      <div className="flex justify-between items-end mb-4 mx-4 z-10">
        <span className="text-xs font-medium text-gray-400">Fase: <span style={{ color: currentColor }}>{currentPhaseName}</span></span>
        {daysLeft > 0 ? (
          <span className="text-[10px] font-medium bg-white/5 px-2 py-1 rounded text-gray-300 border border-white/10">
            Faltan <strong className="text-white">{daysLeft}</strong> días
          </span>
        ) : (
          <span className="text-[10px] font-bold bg-neon-orange/20 px-2 py-1 rounded text-neon-orange border border-neon-orange/50 animate-pulse">
            ¡Lista para cortar!
          </span>
        )}
      </div>

      {/* Target Mode: Parámetros Ideales */}
      <div className="border-t border-white/5 bg-[#050505]/50 p-4 mt-auto">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-300 uppercase tracking-widest">Parámetros Ideales</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#111] border border-white/5 rounded-lg p-2 text-center">
            <div className="text-[10px] text-gray-500 mb-1">Temp</div>
            <div className="text-xs font-bold text-white">{idealParams.temp}°</div>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-lg p-2 text-center">
            <div className="text-[10px] text-gray-500 mb-1">Hum</div>
            <div className="text-xs font-bold text-white">{idealParams.hum}%</div>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-lg p-2 text-center">
            <div className="text-[10px] text-gray-500 mb-1">VPD</div>
            <div className="text-xs font-bold text-neon-orange">{idealParams.vpd}</div>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-lg p-2 text-center">
            <div className="text-[10px] text-gray-500 mb-1">pH</div>
            <div className="text-xs font-bold text-white">{idealParams.ph}</div>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-lg p-2 text-center">
            <div className="text-[10px] text-gray-500 mb-1">EC</div>
            <div className="text-xs font-bold text-white">{idealParams.ec}</div>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-lg p-2 text-center">
            <div className="text-[10px] text-gray-500 mb-1">PPFD</div>
            <div className="text-xs font-bold text-[#FFD700]">{idealParams.ppfd}</div>
          </div>
        </div>
      </div>

      {/* Barra de Progreso Interactiva (Fondo de Tarjeta) */}
      <div className="relative h-1.5 w-full bg-black group/bar mt-auto">
        {/* Tooltip flotante */}
        {activeTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black border border-white/10 text-[10px] text-gray-300 p-2 rounded shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 text-center pointer-events-none">
            {activeTooltip === 'germ' && tooltips.germ}
            {activeTooltip === 'veg' && tooltips.veg}
            {activeTooltip === 'flow' && tooltips.flow}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/10"></div>
          </div>
        )}

        <div className="h-full w-full flex cursor-help">
          <div 
            onMouseEnter={() => setActiveTooltip('germ')}
            onMouseLeave={() => setActiveTooltip(null)}
            style={{ width: `${germPercent}%`, backgroundColor: '#FFBF00', opacity: currentPercent >= germPercent ? 1 : 0.2 }} 
            className="hover:brightness-125 transition-all"
          />
          <div 
            onMouseEnter={() => setActiveTooltip('veg')}
            onMouseLeave={() => setActiveTooltip(null)}
            style={{ width: `${vegPercent}%`, backgroundColor: '#50C878', opacity: currentPercent >= (germPercent + vegPercent) ? 1 : (currentPercent > germPercent ? 1 : 0.2) }} 
            className="hover:brightness-125 transition-all"
          />
          <div 
            onMouseEnter={() => setActiveTooltip('flow')}
            onMouseLeave={() => setActiveTooltip(null)}
            style={{ width: `${flowPercent}%`, backgroundColor: '#FF5F1F', opacity: currentPercent >= 100 ? 1 : (currentPercent > (germPercent + vegPercent) ? 1 : 0.2) }} 
            className="hover:brightness-125 transition-all"
          />
        </div>
        
        {/* Barra de progreso real */}
        <div className="absolute top-0 left-0 h-full flex transition-all duration-1000 ease-out pointer-events-none" style={{ width: `${currentPercent}%` }}>
          <div style={{ width: `${(germPercent / currentPercent) * 100}%`, backgroundColor: '#FFBF00' }} />
          <div style={{ width: `${(vegPercent / currentPercent) * 100}%`, backgroundColor: '#50C878' }} />
          <div style={{ width: `${(flowPercent / currentPercent) * 100}%`, backgroundColor: '#FF5F1F' }} />
        </div>

        {/* Current Position Dot */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,1)] transition-all duration-1000 ease-out z-10 pointer-events-none"
          style={{ 
            left: `calc(${currentPercent}% - 5px)`,
            backgroundColor: currentColor
          }}
        />
      </div>

      {/* Modal de Confirmación de Borrado */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-red-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Eliminar Planta</h3>
            <p className="text-sm text-gray-400 mb-6">
              ¿Seguro que quieres eliminar a <span className="text-white font-medium">{plant.name}</span>? 
              Se borrarán también todos sus logs, fotos y datos biométricos. Esta acción es irreversible.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-lg bg-[#1A1A1A] text-white font-medium text-sm hover:bg-[#222] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


