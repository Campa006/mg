'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, Square, Loader2, WifiOff, PenTool } from 'lucide-react'
import { processVoiceLog, syncOfflineLogs } from '@/app/actions/aiActions'
import { saveOfflineLog, getUnsyncedLogs, markLogAsSynced, cleanOldLogs } from '@/lib/utils/indexeddb'
import { toast } from 'sonner'

interface VoiceLogButtonProps {
  plantId: string;
}

export function VoiceLogButton({ plantId }: VoiceLogButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  // Sincronización de estado de red
  useEffect(() => {
    setIsOffline(!navigator.onLine)
    
    const handleOnline = async () => {
      setIsOffline(false)
      // Sincronizar datos pendientes
      const unsynced = await getUnsyncedLogs()
      if (unsynced.length > 0) {
        const result = await syncOfflineLogs(unsynced)
        if (result.success) {
          for (const log of unsynced) {
            await markLogAsSynced(log.id)
          }
          window.dispatchEvent(new CustomEvent('refresh-plant-logs', { detail: { plantId } }))
        }
      }
      // Limpiar caché vieja
      await cleanOldLogs()
    }
    
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Check initial sync just in case
    if (navigator.onLine) {
      handleOnline()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [plantId])

  // Configuración de Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'es-ES'

        recognition.onresult = (event: any) => {
          let currentTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript
          }
          setTranscript(currentTranscript)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error)
          setIsRecording(false)
        }

        recognition.onend = () => {
          setIsRecording(false)
          // Cuando termina de escuchar, procesamos el texto si hay algo
          // Pero lo hacemos en un useEffect observando un estado o directamente aquí si tenemos acceso al último transcript
        }

        recognitionRef.current = recognition
      } else {
        setIsSupported(false)
      }
    }
  }, [])

  const speakConfirmation = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Registro guardado, Master')
      utterance.lang = 'es-ES'
      utterance.rate = 1.2
      utterance.pitch = 0.9
      window.speechSynthesis.speak(utterance)
    } else {
      // Fallback a beep simple
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        const oscillator = audioCtx.createOscillator()
        const gainNode = audioCtx.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioCtx.destination)
        
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime) // A5
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
        
        oscillator.start()
        oscillator.stop(audioCtx.currentTime + 0.1)
      }
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      handleProcessTranscript()
    } else {
      setTranscript('')
      recognitionRef.current?.start()
      setIsRecording(true)
    }
  }

  const handleProcessTranscript = async () => {
    // Usamos un pequeño delay para asegurar que el último texto se haya guardado en el estado
    setTimeout(async () => {
      const finalTranscript = transcriptRef.current
      if (!finalTranscript || finalTranscript.trim() === '') return

      setIsProcessing(true)

      if (navigator.onLine) {
        // Procesamiento Online con IA
        const result = await processVoiceLog(plantId, finalTranscript)
        if (result.success) {
          speakConfirmation()
          toast.success('Log guardado')
          window.dispatchEvent(new CustomEvent('refresh-plant-logs', { detail: { plantId } }))
        } else {
          toast.error(result.error || 'Error al procesar dictado')
        }
      } else {
        // Guardado Offline
        await saveOfflineLog({
          plantId,
          eventType: 'Log de Voz (Offline)',
          diagnosis: 'Log de Voz',
          amount: null,
          notes: finalTranscript,
          createdAt: new Date().toISOString()
        })
        speakConfirmation()
        toast.success('Guardado offline')
        // Mostrar localmente en la UI que se guardó offline
        window.dispatchEvent(new CustomEvent('refresh-plant-logs', { detail: { plantId } }))
      }

      setTranscript('')
      setIsProcessing(false)
    }, 500)
  }

  // Ref hack para tener acceso al último transcript en el setTimeout
  const transcriptRef = useRef(transcript)
  useEffect(() => {
    transcriptRef.current = transcript
  }, [transcript])

  if (!isSupported) {
    return (
      <button
        onClick={() => toast.info('Dictado por voz no soportado en este navegador. Por favor usa notas de texto.')}
        className="w-12 h-12 rounded-full flex items-center justify-center bg-[#121212] border border-white/10 text-gray-400 hover:text-white transition-colors"
        title="Escribir Nota"
      >
        <PenTool className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={toggleRecording}
        disabled={isProcessing}
        className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 relative z-20 ${
          isRecording 
            ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse' 
            : isProcessing
              ? 'bg-[#121212] border border-neon-orange text-neon-orange'
              : 'bg-[#121212] border border-white/10 text-gray-400 hover:text-white hover:border-white/30'
        }`}
        aria-label="Dictar log"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isRecording ? (
          <Square className="w-4 h-4 fill-current" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
        
        {isOffline && !isRecording && !isProcessing && (
          <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
            <WifiOff className="w-3 h-3 text-red-500" />
          </div>
        )}
      </button>

      {/* Floating Transcript Preview */}
      {isRecording && transcript && (
        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-black/90 backdrop-blur-md border border-neon-orange/50 p-3 rounded-xl shadow-[0_0_15px_rgba(255,107,0,0.2)] text-xs text-white z-50 text-center pointer-events-none animate-in fade-in slide-in-from-bottom-2">
          <p className="opacity-70 mb-1 flex items-center justify-center gap-1">
            <Mic className="w-3 h-3 text-neon-orange animate-pulse" /> Escuchando...
          </p>
          <p className="font-medium">"{transcript}"</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neon-orange/50"></div>
        </div>
      )}
    </div>
  )
}