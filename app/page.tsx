'use client'

// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/context/AuthContext'

// export default function Home() {
//   const { user, isLoading } = useAuth()
//   const router = useRouter()

//   useEffect(() => {
//     if (isLoading) return 

//     if (user) {
//       router.replace('/dashboard')
//     } else {
//       router.replace('/login')
//     }
//   }, [user, isLoading, router])

//   return null 
// }

import { redirect } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'

export default function Page() {
  const { user, isLoading } = useAuth()

  if (!user) {
    return redirect('/login');
  } else {
    redirect('/dashboard');
  }
}
