import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateVPD } from '@/lib/utils/vpd'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const apiKey = request.headers.get('x-api-key')
    
    // Verificación de seguridad simple para el webhook
    if (apiKey !== process.env.IOT_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id_planta, temp, hum } = body

    if (!id_planta || temp === undefined || hum === undefined) {
      return NextResponse.json({ error: 'Missing required fields: id_planta, temp, hum' }, { status: 400 })
    }

    const temperature = parseFloat(temp)
    const humidity = parseFloat(hum)
    const vpd = calculateVPD(temperature, humidity)

    const { error } = await supabaseAdmin.from('sensor_data').insert({
      plant_id: id_planta,
      temperature,
      humidity,
      vpd
    })

    if (error) {
      console.error('Error inserting IoT data:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true, vpd })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}