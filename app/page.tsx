'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ProductWithStock } from '@/types'
import ProductCard from '@/components/ProductCard'

export default function HomePage() {
  const [products, setProducts] = useState<ProductWithStock[]>([])
  const [loading, setLoading] = useState(true)
  const [reservingId, setReservingId] = useState<string | null>(null)
  const router = useRouter()

  async function loadProducts() {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }

  useEffect(() => { loadProducts() }, [])

  async function handleReserve(stockId: string) {
    setReservingId(stockId)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockId, quantity: 1 })
      })

      if (res.status === 409) {
        toast.error('Not enough stock available!')
        await loadProducts()
        return
      }

      if (!res.ok) {
        toast.error('Something went wrong. Please try again.')
        return
      }

      const reservation = await res.json()
      toast.success('Item reserved! Complete your purchase.')
      router.push(`/reservations/${reservation.id}`)
    } finally {
      setReservingId(null)
    }
  }

  if (loading) {
    return (
      <main className="p-8 max-w-6xl mx-auto">
        <p className="text-muted-foreground">Loading products...</p>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground mt-1">Reserve items to hold them for 10 minutes while you checkout</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onReserve={handleReserve}
            loading={reservingId}
          />
        ))}
      </div>
    </main>
  )
}
