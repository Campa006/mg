'use client'

import { useState, useEffect } from 'react'
import { FileText, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Trash2, Loader2 } from 'lucide-react'
import { getPlantLogs, deletePlantLog } from '@/app/actions/aiActions'
import { getOfflineLogsForPlant } from '@/lib/utils/indexeddb'
import { toast } from 'sonner'

interface PlantLogsPanelProps {
  plantId: string;
  isOpenInitially?: boolean;
}

export function PlantLogsPanel({ plantId, isOpenInitially = false }: PlantLogsPanelProps) {
  const [isOpen, setIsOpen] = useState(isOpenInitially)
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const loadData = async (reset = false) => {
    const currentPage = reset ? 0 : page
    if (reset) {
      setIsLoading(true)
      setLogs([])
    } else {
      setIsLoadingMore(true)
    }

    const onlineData = await getPlantLogs(plantId, 10, currentPage * 10)
    let merged = onlineData

    // Solo cargamos offline data en la primera página
    if (currentPage === 0) {
      const offlineData = await getOfflineLogsForPlant(plantId)
      merged = [...offlineData, ...onlineData].sort((a, b) => 
        new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime()
      )
    }

    if (onlineData.length < 10) {
      setHasMore(false)
    } else {
      setHasMore(true)
    }
    
    setLogs(prev => reset ? merged : [...prev, ...onlineData])
    setPage(currentPage + 1)
    
    setIsLoading(false)
    setIsLoadingMore(false)
  }

  const handleDelete = async (logId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('¿Seguro que quieres borrar este registro?')) return

    setIsDeleting(logId)
    const result = await deletePlantLog(logId)
    
    if (result.success) {
      setLogs(prev => prev.filter(log => log.id !== logId))
      toast.success('Registro borrado')
    } else {
      toast.error(result.error || 'Error al borrar')
    }
    setIsDeleting(null)
  }

  useEffect(() => {
    if (isOpen && isLoading && logs.length === 0) {
      loadData(true)
    }
  }, [isOpen, plantId, isLoading, logs.length])

  // Exponer una forma de recargar si se añade un log nuevo desde el modal de Doctor AI
  useEffect(() => {
    const handleRefresh = (e: CustomEvent) => {
      if (e.detail?.plantId === plantId) {
        loadData(true)
      }
    }
    window.addEventListener('refresh-plant-logs', handleRefresh as EventListener)
    return () => window.removeEventListener('refresh-plant-logs', handleRefresh as EventListener)
  }, [plantId])

  return (
    <div className="border-t border-white/5 bg-[#050505]/50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-sm font-medium text-gray-300 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span>Diario Médico</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 bg-black/50 px-2 py-0.5 rounded-full border border-white/10">
            {logs.length > 0 ? logs.length : (isLoading && !isOpen ? '...' : 0)}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 rounded-xl bg-black border border-white/5 flex gap-3 animate-pulse">
                  <div className="w-16 h-16 rounded-lg bg-white/5 shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-white/5 rounded w-3/4"></div>
                    <div className="h-2 bg-white/5 rounded w-1/4"></div>
                    <div className="h-2 bg-white/5 rounded w-full mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-4 text-xs text-gray-500 bg-black/20 rounded-xl border border-white/5">
              Aún no hay escaneos del Doctor AI.
            </div>
          ) : (
            logs.map((log) => {
              const isVoiceLog = log.diagnosis === 'Log de Voz' || log.eventType?.includes('Voz');
              const isHealthy = !isVoiceLog && (log.diagnosis.toLowerCase() === 'sana' || log.probability < 50);
              const date = new Date(log.created_at || log.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
              });

              return (
                <div key={log.id} className="p-3 rounded-xl bg-black border border-white/5 flex gap-3 group hover:border-white/10 transition-colors">
                  {/* Thumbnail / Icon */}
                  {log.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={log.image_url} 
                      alt="Escaneo" 
                      className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-lg border border-white/10 flex items-center justify-center shrink-0 ${isVoiceLog ? 'bg-neon-orange/10 border-neon-orange/30' : 'bg-[#111]'}`}>
                      <FileText className={`w-6 h-6 ${isVoiceLog ? 'text-neon-orange' : 'text-gray-600'}`} />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-white truncate pr-2">
                        {isVoiceLog ? (log.event_type || log.eventType) : log.diagnosis}
                      </h4>
                      <div className="flex items-center gap-2">
                        {!isVoiceLog && (
                          isHealthy ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                          )
                        )}
                        {log.synced === false && (
                          <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Offline</span>
                        )}
                        {log.synced !== false && (
                          <button 
                            onClick={(e) => handleDelete(log.id, e)}
                            disabled={isDeleting === log.id}
                            className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          >
                            {isDeleting === log.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-gray-500 mb-1.5">
                      {date} {log.amount && <span className="text-neon-orange font-bold ml-1">• {log.amount}</span>}
                    </p>
                    
                    {(!isHealthy || isVoiceLog) && (
                      <p className="text-[10px] text-gray-400 line-clamp-2 leading-tight">
                        {!isVoiceLog && <span className="text-neon-orange font-medium">Acción: </span>} 
                        {log.suggested_action || log.notes}
                      </p>
                    )}
                  </div>
                </div>
              )
            })
          )}
          
          {!isLoading && hasMore && logs.length > 0 && (
            <button 
              onClick={() => loadData(false)}
              disabled={isLoadingMore}
              className="w-full py-2 mt-2 text-xs font-medium text-neon-orange bg-neon-orange/10 hover:bg-neon-orange/20 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoadingMore ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cargar más registros'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}