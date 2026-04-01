'use client'

import React, { useState, useEffect } from 'react'
import { useStealth } from './providers/StealthProvider'

export function FakeUI() {
  const { showFakeUI, setShowFakeUI } = useStealth()
  const [clickCount, setClickCount] = useState(0)
  const [pinInput, setPinInput] = useState('')

  // Efecto para manejar pulsaciones de teclado si el usuario está en PC
  useEffect(() => {
    if (!showFakeUI) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Si el usuario escribe 'exit' o un PIN, podemos ocultarlo
      if (e.key === 'Escape') {
        setShowFakeUI(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showFakeUI, setShowFakeUI])

  if (!showFakeUI) return null

  // Tap secreto para salir: 3 taps rápidos en el encabezado
  const handleSecretTap = () => {
    setClickCount(prev => {
      const newCount = prev + 1
      if (newCount >= 3) {
        setShowFakeUI(false)
        return 0
      }
      // Resetear contador después de 1 segundo
      setTimeout(() => setClickCount(0), 1000)
      return newCount
    })
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white text-black font-sans overflow-y-auto">
      {/* Header aburrido */}
      <header 
        onClick={handleSecretTap}
        className="bg-gray-100 border-b border-gray-300 p-4 select-none cursor-default"
      >
        <h1 className="text-xl font-bold text-gray-800">Control de Gastos 2024</h1>
        <p className="text-sm text-gray-500">Hoja de cálculo mensual</p>
      </header>

      {/* Contenido aburrido tipo hoja de cálculo */}
      <div className="p-4">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border p-2 font-semibold text-gray-600">Fecha</th>
              <th className="border p-2 font-semibold text-gray-600">Concepto</th>
              <th className="border p-2 font-semibold text-gray-600 text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: '01/03', desc: 'Supermercado', amount: '-$120.50' },
              { date: '03/03', desc: 'Gasolina', amount: '-$45.00' },
              { date: '05/03', desc: 'Factura Luz', amount: '-$80.20' },
              { date: '10/03', desc: 'Internet', amount: '-$35.00' },
              { date: '12/03', desc: 'Nómina', amount: '+$2,450.00' },
              { date: '15/03', desc: 'Farmacia', amount: '-$22.30' },
              { date: '18/03', desc: 'Restaurante', amount: '-$55.00' },
              { date: '22/03', desc: 'Material Oficina', amount: '-$15.90' },
              { date: '25/03', desc: 'Suscripciones', amount: '-$19.99' },
            ].map((row, i) => (
              <tr key={i} className="border-b">
                <td className="border p-2 text-gray-600">{row.date}</td>
                <td className="border p-2 text-gray-700">{row.desc}</td>
                <td className={`border p-2 text-right font-medium ${row.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {row.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Documento generado automáticamente.</p>
          <p>Confidencial. No compartir.</p>
        </div>
      </div>
    </div>
  )
}
