export type ReservationStatus = 'pending' | 'confirmed' | 'released'

export type ProductWithStock = {
  id: string
  name: string
  sku: string
  price: number
  stock: {
    id: string
    total: number
    reserved: number
    available: number
    warehouse: {
      id: string
      name: string
      city: string
    }
  }[]
}

export type ReservationWithDetails = {
  id: string
  quantity: number
  status: ReservationStatus
  expiresAt: string
  createdAt: string
  stock: {
    product: { name: string; price: number }
    warehouse: { name: string; city: string }
  }
}
