'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ReservationWithDetails } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReservationTimer from '@/components/ReservationTimer'

export default function ReservationPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [reservation, setReservation] = useState<ReservationWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)

  useEffect(() => {
    fetch(`/api/reservations/${id}`)
      .then((r) => r.json())
      .then(setReservation)
      .finally(() => setLoading(false))
  }, [id])

  async function handleConfirm() {
    setActing(true)
    try {
      const res = await fetch(`/api/reservations/${id}/confirm`, { method: 'POST' })
      if (res.status === 410) {
        toast.error('Reservation expired. Please start over.')
        router.push('/')
        return
      }
      const updated = await res.json()
      setReservation(updated)
      toast.success('Purchase confirmed! 🎉')
    } finally {
      setActing(false)
    }
  }

  async function handleRelease() {
    setActing(true)
    try {
      await fetch(`/api/reservations/${id}/release`, { method: 'POST' })
      toast.info('Reservation cancelled.')
      router.push('/')
    } finally {
      setActing(false)
    }
  }

  if (loading) return <main className="p-8 max-w-xl mx-auto"><p>Loading...</p></main>
  if (!reservation) return <main className="p-8 max-w-xl mx-auto"><p>Reservation not found.</p></main>

  const statusStyles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    released: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <main className="p-8 max-w-xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')}>← Back to products</Button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{reservation.stock.product.name}</CardTitle>
            <Badge className={statusStyles[reservation.status]}>
              {reservation.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Warehouse</p>
              <p className="font-medium">{reservation.stock.warehouse.name}</p>
              <p className="text-muted-foreground text-xs">{reservation.stock.warehouse.city}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-medium">{reservation.quantity}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Price</p>
              <p className="font-medium text-lg">₹{Number(reservation.stock.product.price).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Reservation ID</p>
              <p className="font-mono text-xs truncate">{reservation.id}</p>
            </div>
          </div>

          {reservation.status === 'pending' && (
            <>
              <ReservationTimer expiresAt={reservation.expiresAt} />
              <div className="flex gap-3 pt-2">
                <Button onClick={handleConfirm} disabled={acting} className="flex-1">
                  {acting ? 'Processing...' : 'Confirm Purchase'}
                </Button>
                <Button onClick={handleRelease} disabled={acting} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </>
          )}

          {reservation.status === 'confirmed' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-700 font-semibold text-lg">✅ Purchase Confirmed!</p>
              <p className="text-green-600 text-sm mt-1">Thank you for your order.</p>
              <Button className="mt-4" onClick={() => router.push('/')}>Continue Shopping</Button>
            </div>
          )}

          {reservation.status === 'released' && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-gray-700 font-semibold">Reservation Cancelled</p>
              <Button className="mt-4" variant="outline" onClick={() => router.push('/')}>Back to Products</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
