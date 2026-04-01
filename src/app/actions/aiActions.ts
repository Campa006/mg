'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzePlantHealth(plantId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  const file = formData.get('image') as File
  if (!file) {
    return { error: 'No se proporcionó ninguna imagen' }
  }

  const vpd = formData.get('vpd')
  const temp = formData.get('temp')
  const hum = formData.get('hum')

  let contextPrompt = "Analiza esta hoja de cannabis. Identifica si hay deficiencias (Nitrógeno, Magnesio, etc.), plagas (Araña roja, trips) o excesos. Responde ESTRICTAMENTE en formato JSON con la siguiente estructura: {\"diagnosis\": \"nombre del problema\", \"probability\": 95, \"suggested_action\": \"acción a tomar\"}. Si se ve sana, indícalo también."
  
  if (vpd && temp && hum) {
    contextPrompt = `Analiza esta imagen teniendo en cuenta que el entorno actual tiene un VPD de ${vpd} kPa (Temp: ${temp}°C, Hum: ${hum}%). Cruza los síntomas visuales con los datos ambientales para un diagnóstico 100% preciso. Responde ESTRICTAMENTE en formato JSON con la siguiente estructura: {\"diagnosis\": \"nombre del problema\", \"probability\": 95, \"suggested_action\": \"acción a tomar\"}. Si se ve sana, indícalo también.`
  }

  try {
    // 1. Convert file to base64 for OpenAI API
    const buffer = await file.arrayBuffer()
    const base64Image = Buffer.from(buffer).toString('base64')
    const mimeType = file.type

    // 2. Upload to Supabase Storage
    const fileName = `${user.id}/${plantId}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('plant_images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return { error: 'Error al subir la imagen' }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('plant_images')
      .getPublicUrl(fileName)

    // 3. Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: contextPrompt 
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    })

    const aiResult = JSON.parse(response.choices[0].message.content || '{}')

    // 4. Save to database
    const { error: dbError } = await supabase.from('plant_logs').insert({
      plant_id: plantId,
      image_url: publicUrl,
      diagnosis: aiResult.diagnosis || 'Desconocido',
      probability: aiResult.probability || 0,
      suggested_action: aiResult.suggested_action || 'Consultar especialista',
      notes: 'Análisis generado por Doctor AI'
    })

    if (dbError) {
      console.error('Error saving log:', dbError)
      return { error: 'Error al guardar el diagnóstico' }
    }

    revalidatePath('/')
    return { success: true, data: aiResult, imageUrl: publicUrl }

  } catch (error) {
    console.error('Error in analyzePlantHealth:', error)
    return { error: 'Error en el análisis de IA' }
  }
}

export async function processVoiceLog(plantId: string, transcribedText: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  if (!transcribedText || transcribedText.trim() === '') {
    return { error: 'Texto vacío' }
  }

  try {
    // Call OpenAI to extract entities
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Faster model for text processing
      messages: [
        {
          role: "system",
          content: "Eres un asistente experto en cultivo de cannabis. Extrae la información del siguiente dictado de voz del usuario. Responde ESTRICTAMENTE en formato JSON con esta estructura: {\"event_type\": \"Riego|Fertilizante|Poda|Observación|Otro\", \"amount\": \"Cantidad extraída si existe, ej: '2L', '5ml', o null\", \"notes\": \"Resumen claro de lo que dijo el usuario\"}"
        },
        {
          role: "user",
          content: transcribedText
        }
      ],
      response_format: { type: "json_object" }
    })

    const aiResult = JSON.parse(response.choices[0].message.content || '{}')
    
    // Save to database
    const { data: insertedLog, error: dbError } = await supabase.from('plant_logs').insert({
      plant_id: plantId,
      event_type: aiResult.event_type || 'Observación',
      diagnosis: 'Log de Voz', // Usamos diagnosis para el título principal en la UI actual
      amount: aiResult.amount || null,
      notes: aiResult.notes || transcribedText,
      probability: 100, // No es una predicción, es un hecho
      suggested_action: transcribedText // Guardamos la transcripción original aquí por si acaso
    }).select().single()

    if (dbError) {
      console.error('Error saving voice log:', dbError)
      return { error: 'Error al guardar el registro en la base de datos' }
    }

    revalidatePath('/')
    return { success: true, data: insertedLog }

  } catch (error) {
    console.error('Error in processVoiceLog:', error)
    return { error: 'Error procesando el dictado con IA' }
  }
}

export async function syncOfflineLogs(logs: any[]) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  if (!logs || logs.length === 0) return { success: true }

  // Formatear para Supabase
  const logsToInsert = logs.map(log => ({
    plant_id: log.plantId,
    event_type: log.eventType,
    diagnosis: log.diagnosis,
    amount: log.amount,
    notes: log.notes,
    created_at: log.createdAt,
    probability: 100,
    suggested_action: 'Sincronizado offline'
  }))

  const { error } = await supabase.from('plant_logs').insert(logsToInsert)

  if (error) {
    console.error('Error syncing logs:', error)
    return { error: 'Error sincronizando registros' }
  }

  revalidatePath('/')
  return { success: true }
}

export async function getPlantLogs(plantId: string, limit: number = 10, offset: number = 0) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('plant_logs')
    .select('*')
    .eq('plant_id', plantId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
    
  if (error) {
    console.error('Error fetching logs:', error)
    return []
  }
  
  return data
}

export async function deletePlantLog(logId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  // Verificar propiedad
  const { data: log } = await supabase.from('plant_logs').select('plant_id').eq('id', logId).single()
  if (!log) return { error: 'Log no encontrado' }
  
  const { data: plant } = await supabase.from('plants').select('user_id').eq('id', log.plant_id).single()
  if (!plant || plant.user_id !== user.id) return { error: 'No autorizado para borrar este log' }

  const { error } = await supabase.from('plant_logs').delete().eq('id', logId)
  if (error) {
    console.error('Error deleting log:', error)
    return { error: 'Error al borrar el log' }
  }

  revalidatePath('/')
  return { success: true }
}