'use client'

import { useEffect, useState } from 'react'

export default function ReservationTimer({ expiresAt }: { expiresAt: string }) {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    const calc = () => {
      const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      setSecondsLeft(Math.max(0, diff))
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isUrgent = secondsLeft < 60 && secondsLeft > 0

  if (secondsLeft === 0) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-bold text-center">⏰ Reservation expired!</p>
      </div>
    )
  }

  return (
    <div className={`p-3 rounded-lg border text-center ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
      <p className="text-sm text-muted-foreground mb-1">Time remaining</p>
      <p className={`text-3xl font-mono font-bold ${isUrgent ? 'text-red-600' : 'text-green-600'}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
    </div>
  )
}
