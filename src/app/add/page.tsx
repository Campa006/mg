import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AddPlantForm } from '@/components/AddPlantForm'

export default async function AddPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col min-h-screen bg-black w-full pb-24 pt-8 px-4 sm:px-6">
      <div className="w-full max-w-md mx-auto">
        <AddPlantForm />
      </div>
    </div>
  )
}
