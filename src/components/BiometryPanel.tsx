'use client'

import { useState, useEffect } from 'react'
import { Thermometer, Droplets, Activity, Plus, ChevronDown, ChevronUp, Radio } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts'
import { getVPDStatus } from '@/lib/utils/vpd'
import { addSensorData, getPlantSensorData } from '@/app/actions/sensorActions'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface BiometryPanelProps {
  plantId: string;
  isOpenInitially?: boolean;
}

export function BiometryPanel({ plantId, isOpenInitially = false }: BiometryPanelProps) {
  const [isOpen, setIsOpen] = useState(isOpenInitially)
  const [temperature, setTemperature] = useState('')
  const [humidity, setHumidity] = useState('')
  const [loading, setLoading] = useState(false)
  const [sensorData, setSensorData] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLive, setIsLive] = useState(false)
  
  useEffect(() => {
    async function loadData() {
      const data = await getPlantSensorData(plantId)
      setSensorData(data)
      setIsLoadingData(false)
      checkLiveStatus(data)
    }
    if (isOpen && isLoadingData) {
      loadData()
    }
  }, [isOpen, plantId, isLoadingData])

  // Suscripción a Realtime
  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
      .channel(`sensor_data_${plantId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'sensor_data',
        filter: `plant_id=eq.${plantId}`
      }, (payload) => {
        const newData = payload.new
        setSensorData(prev => {
          const updated = [...prev, newData]
          if (updated.length > 24) return updated.slice(updated.length - 24)
          return updated
        })
        setIsLive(true)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [plantId])

  // Chequear estado en vivo (datos con menos de 5 min)
  const checkLiveStatus = (data: any[]) => {
    if (data.length === 0) return setIsLive(false)
    const latest = data[data.length - 1]
    const timeDiff = new Date().getTime() - new Date(latest.created_at).getTime()
    setIsLive(timeDiff < 5 * 60 * 1000) // 5 minutos
  }

  // Intervalo para actualizar el estado "en vivo" visualmente
  useEffect(() => {
    const interval = setInterval(() => {
      checkLiveStatus(sensorData)
    }, 60000) // Revisar cada minuto
    return () => clearInterval(interval)
  }, [sensorData])

  const latestReading = sensorData.length > 0 ? sensorData[sensorData.length - 1] : null
  const currentVPD = latestReading ? latestReading.vpd : null
  const vpdStatus = currentVPD !== null ? getVPDStatus(currentVPD) : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!temperature || !humidity) return
    
    setLoading(true)
    const formData = new FormData()
    formData.append('temperature', temperature)
    formData.append('humidity', humidity)
    
    const result = await addSensorData(plantId, formData)
    
    if (result.success) {
      // Optimistic or simple reload strategy:
      // For simplicity, we just add the new calculated reading locally
      const { calculateVPD } = await import('@/lib/utils/vpd')
      const tempNum = parseFloat(temperature)
      const humNum = parseFloat(humidity)
      const vpd = calculateVPD(tempNum, humNum)
      
      const newReading = {
        id: Date.now().toString(),
        temperature: tempNum,
        humidity: humNum,
        vpd,
        created_at: new Date().toISOString()
      }
      
      setSensorData(prev => {
        const newData = [...prev, newReading]
        if (newData.length > 5) return newData.slice(newData.length - 5)
        return newData
      })
      
      setTemperature('')
      setHumidity('')
      toast.success('Registro guardado')
    } else {
      toast.error(result.error || 'Error al guardar')
    }
    
    setLoading(false)
  }

  // Format data for Recharts
  const chartData = sensorData.map((d, i) => {
    const date = new Date(d.created_at)
    return {
      name: `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`,
      Temp: d.temperature,
      Hum: d.humidity
    }
  })

  // Chequeo de alerta de estrés prolongado (últimos 10 mins aprox)
  const isCriticalStress = () => {
    if (sensorData.length < 2) return false
    // Tomamos las lecturas de los últimos 10 mins aprox
    const recent = sensorData.slice(-3) 
    return recent.every(d => d.vpd < 0.4 || d.vpd > 1.6)
  }

  const showStressAlert = isCriticalStress()

  return (
    <div className="border-t border-white/5 mt-2 bg-[#0A0A0A]/50 relative">
      {/* Alerta Global */}
      {showStressAlert && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.8)] animate-pulse z-50 whitespace-nowrap">
          ¡ALERTA DE ESTRÉS BIOMÉTRICO!
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-sm font-medium text-gray-300 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-neon-orange" />
          <span>Biometría y VPD</span>
          {isLive && (
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded ml-2 border border-green-500/20">
              <Radio className="w-3 h-3 animate-pulse" /> Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {vpdStatus && (
            <div className={`w-2 h-2 rounded-full ${vpdStatus.bg.replace('/20', '')}`} />
          )}
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-4">
          {/* VPD Status Card */}
          {currentVPD !== null && vpdStatus && (
            <div className={`p-3 rounded-xl border ${vpdStatus.border} ${vpdStatus.bg} flex items-center justify-between`}>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">VPD Actual</p>
                <p className={`text-lg font-bold ${vpdStatus.color}`}>{currentVPD} kPa</p>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${vpdStatus.color} bg-black/40`}>
                {vpdStatus.label}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Thermometer className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="number" 
                step="0.1"
                placeholder="Temp °C"
                value={temperature}
                onChange={e => setTemperature(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg py-2 pl-7 pr-2 text-xs text-white focus:border-neon-orange focus:outline-none"
                required
              />
            </div>
            <div className="flex-1 relative">
              <Droplets className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="number" 
                step="1"
                placeholder="Hum %"
                value={humidity}
                onChange={e => setHumidity(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg py-2 pl-7 pr-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#121212] border border-white/10 rounded-lg w-10 flex items-center justify-center hover:border-neon-orange transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </form>

          {/* Chart */}
          {isLoadingData ? (
            <div className="h-40 w-full pt-4 border-t border-white/5 flex flex-col justify-center">
              <div className="animate-pulse space-y-4">
                <div className="h-3 bg-white/5 rounded w-1/3 mx-auto"></div>
                <div className="h-24 bg-white/5 rounded-lg w-full"></div>
              </div>
            </div>
          ) : sensorData.length > 0 ? (
            <div className="h-40 w-full pt-4 border-t border-white/5">
              <p className="text-[10px] text-gray-500 mb-2 text-center uppercase tracking-widest">
                Temperatura vs Humedad (24h)
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#666' }} axisLine={false} tickLine={false} minTickGap={20} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9, fill: '#FF5F1F' }} axisLine={false} tickLine={false} width={30} domain={['dataMin - 2', 'dataMax + 2']} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#3B82F6' }} axisLine={false} tickLine={false} width={30} domain={['dataMin - 5', 'dataMax + 5']} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#fff', padding: '2px 0' }}
                    labelStyle={{ color: '#888', marginBottom: '4px' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="Temp" name="Temp °C" stroke="#FF5F1F" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#FF5F1F', stroke: '#000', strokeWidth: 2 }} />
                  <Line yAxisId="right" type="monotone" dataKey="Hum" name="Hum %" stroke="#3B82F6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#3B82F6', stroke: '#000', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-gray-500 border-t border-white/5">
              No hay datos biométricos aún.
            </div>
          )}
        </div>
      )}
    </div>
  )
}