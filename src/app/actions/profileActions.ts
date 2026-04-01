'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleStealthModeAction(isActive: boolean) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({ 
      id: user.id, 
      stealth_mode_active: isActive 
    }, { onConflict: 'id' })

  if (error) {
    console.error('Error updating stealth mode:', error)
    return { error: 'Error al actualizar configuración' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function getStealthStatus() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data } = await supabase
    .from('profiles')
    .select('stealth_mode_active')
    .eq('id', user.id)
    .single()

  return data?.stealth_mode_active || false
}
