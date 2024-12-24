'use client'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
export default function Employees() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    return <p>Loading...</p>; // Show a spinner or placeholder while verifying authentication
  }

  
  return (
    <div className="container">
      <h1>Employees</h1>
      <p>Employees management page coming soon...</p>
    </div>
  )
} 