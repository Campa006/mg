'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addPlant(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  const name = formData.get('name') as string
  const genetica = formData.get('genetica') as string
  const fecha_inicio = formData.get('fecha_inicio') as string
  const ciclo_total_estimado = parseInt(formData.get('ciclo_total_estimado') as string) || 80

  if (!name || !genetica || !fecha_inicio) {
    return { error: 'Faltan campos obligatorios' }
  }

  const { error } = await supabase.from('plants').insert({
    user_id: user.id,
    name,
    genetica,
    fecha_inicio,
    ciclo_total_estimado,
  })

  if (error) {
    console.error('Error insertando planta:', error)
    return { error: 'Error al guardar la planta' }
  }

  revalidatePath('/')
  return { success: true }
}

export async function updatePlantDates(plantId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  const fecha_inicio = formData.get('fecha_inicio') as string
  const ciclo_total_estimado = parseInt(formData.get('ciclo_total_estimado') as string)

  if (!fecha_inicio || !ciclo_total_estimado) {
    return { error: 'Faltan campos obligatorios' }
  }

  const { error } = await supabase
    .from('plants')
    .update({
      fecha_inicio,
      ciclo_total_estimado,
    })
    .eq('id', plantId)
    .eq('user_id', user.id) // Doble seguridad

  if (error) {
    console.error('Error actualizando planta:', error)
    return { error: 'Error al actualizar la planta' }
  }

  revalidatePath('/')
  return { success: true }
}

export async function deletePlant(plantId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  // Verificar propiedad
  const { data: plant } = await supabase
    .from('plants')
    .select('user_id')
    .eq('id', plantId)
    .single()

  if (!plant || plant.user_id !== user.id) {
    return { error: 'No autorizado para borrar esta planta' }
  }

  // Eliminar imágenes asociadas en el Storage (Opcional, pero recomendado para no ocupar espacio)
  // Las fotos de los logs están en la carpeta `${user.id}/${plantId}/...`
  try {
    const { data: files } = await supabase.storage.from('plant_images').list(`${user.id}/${plantId}`)
    if (files && files.length > 0) {
      const pathsToDelete = files.map(file => `${user.id}/${plantId}/${file.name}`)
      await supabase.storage.from('plant_images').remove(pathsToDelete)
    }
  } catch (e) {
    console.error('Error cleaning up images:', e)
    // No bloqueamos el borrado de la planta si falla la limpieza de imágenes
  }

  // El ON DELETE CASCADE en la BD se encargará de borrar los registros en plant_logs y sensor_data
  const { error } = await supabase
    .from('plants')
    .delete()
    .eq('id', plantId)

  if (error) {
    console.error('Error deleting plant:', error)
    return { error: 'Error al eliminar la planta' }
  }

  revalidatePath('/')
  return { success: true }
}

