'use client'

import { useState, useRef } from 'react'
import { Camera, X, Upload, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { analyzePlantHealth } from '@/app/actions/aiActions'
import imageCompression from 'browser-image-compression'
import { toast } from 'sonner'

interface DoctorAIModalProps {
  plantId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentVpd?: number | null;
  currentTemp?: number | null;
  currentHum?: number | null;
}

export function DoctorAIModal({ plantId, isOpen, onClose, onSuccess, currentVpd, currentTemp, currentHum }: DoctorAIModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setResult(null)
      setError(null)
    }
  }

  const handleScan = async () => {
    if (!file) return

    setIsScanning(true)
    setError(null)

    try {
      // Compress image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      }
      
      const compressedFile = await imageCompression(file, options)
      
      const formData = new FormData()
      formData.append('image', compressedFile)
      if (currentVpd !== undefined && currentVpd !== null) formData.append('vpd', currentVpd.toString())
      if (currentTemp !== undefined && currentTemp !== null) formData.append('temp', currentTemp.toString())
      if (currentHum !== undefined && currentHum !== null) formData.append('hum', currentHum.toString())

      const response = await analyzePlantHealth(plantId, formData)

      setIsScanning(false)

      if (response.error) {
        setError(response.error)
        toast.error(response.error)
      } else if (response.success) {
        setResult(response.data)
        toast.success('Análisis completado con éxito')
        // Disparar evento personalizado para actualizar el Diario Médico
        window.dispatchEvent(new CustomEvent('refresh-plant-logs', { detail: { plantId } }))
        if (onSuccess) onSuccess()
      }
    } catch (err) {
      console.error(err)
      setError('Error al procesar la imagen')
      toast.error('Error al procesar la imagen')
      setIsScanning(false)
    }
  }

  const resetState = () => {
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black border border-neon-orange flex items-center justify-center neon-glow">
              <Activity className="w-4 h-4 text-neon-orange" />
            </div>
            <h3 className="font-bold text-white">Doctor AI</h3>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          {!file ? (
            <div 
              className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-neon-orange/50 transition-colors bg-black/50 h-64"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-12 h-12 text-gray-500 mb-4" />
              <p className="text-white font-medium mb-2">Tomar foto o subir imagen</p>
              <p className="text-xs text-gray-500">Asegúrate de que la hoja se vea clara y enfocada</p>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview with Scanning Effect */}
              <div className="relative rounded-xl overflow-hidden bg-black border border-white/10 aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl!} alt="Preview" className={`w-full h-full object-cover ${isScanning ? 'opacity-50 grayscale' : ''}`} />
                
                {isScanning && (
                  <>
                    <div className="absolute inset-0 bg-neon-orange/10 mix-blend-overlay"></div>
                    {/* Scanner line animation */}
                    <div className="absolute left-0 right-0 h-1 bg-neon-orange shadow-[0_0_15px_#FF5F1F] animate-[scan_2s_ease-in-out_infinite]"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-neon-orange font-bold tracking-widest drop-shadow-md">
                      <Activity className="w-8 h-8 mb-2 animate-pulse" />
                      ANALIZANDO...
                    </div>
                  </>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Results */}
              {result && (
                <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
                  <div className={`p-4 rounded-xl border ${result.probability > 80 && result.diagnosis.toLowerCase() !== 'sana' ? 'bg-red-950/20 border-red-900/50' : 'bg-green-950/20 border-green-900/50'}`}>
                    <div className="flex items-start gap-3">
                      {result.probability > 80 && result.diagnosis.toLowerCase() !== 'sana' ? (
                        <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-bold text-white mb-1">{result.diagnosis}</h4>
                        <p className="text-xs text-gray-400">Probabilidad: <span className="text-white font-medium">{result.probability}%</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#1A1A1A] border border-white/5">
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Acción Sugerida</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {result.suggested_action}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 bg-black/50 flex gap-3">
          {file && !isScanning && !result && (
            <>
              <button 
                onClick={resetState}
                className="flex-1 py-3 px-4 rounded-lg bg-[#1A1A1A] text-white font-medium text-sm hover:bg-[#222] transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleScan}
                className="flex-1 py-3 px-4 rounded-lg bg-neon-orange text-black font-bold text-sm hover:bg-orange-600 transition-colors neon-glow flex items-center justify-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Analizar
              </button>
            </>
          )}
          {result && (
            <button 
              onClick={handleClose}
              className="w-full py-3 px-4 rounded-lg bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors"
            >
              Cerrar y Guardar en Logs
            </button>
          )}
        </div>
      </div>
    </div>
  )
}