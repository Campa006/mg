'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculateVPD } from '@/lib/utils/vpd'

export async function addSensorData(plantId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  const tempStr = formData.get('temperature') as string
  const humStr = formData.get('humidity') as string

  if (!tempStr || !humStr) {
    return { error: 'Faltan campos obligatorios' }
  }

  const temperature = parseFloat(tempStr)
  const humidity = parseFloat(humStr)

  if (isNaN(temperature) || isNaN(humidity)) {
    return { error: 'Valores inválidos' }
  }

  const vpd = calculateVPD(temperature, humidity)

  const { error } = await supabase.from('sensor_data').insert({
    plant_id: plantId,
    temperature,
    humidity,
    vpd
  })

  if (error) {
    console.error('Error insertando datos de sensor:', error)
    return { error: 'Error al guardar datos biométricos' }
  }

  revalidatePath('/')
  return { success: true }
}

export async function getPlantSensorData(plantId: string) {
  const supabase = await createClient()
  
  // Obtenemos los últimos 24 registros (asumiendo 1 por hora para 24h, o ajusta según frecuencia)
  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .eq('plant_id', plantId)
    .order('created_at', { ascending: false })
    .limit(24)
    
  if (error) {
    console.error('Error fetching sensor data:', error)
    return []
  }
  
  // Revertimos para que el gráfico los muestre de más antiguo a más nuevo
  return data.reverse()
}