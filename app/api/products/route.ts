import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      stock: { include: { warehouse: true } }
    }
  })

  const formatted = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    price: Number(p.price),
    stock: p.stock.map((s) => ({
      id: s.id,
      total: s.total,
      reserved: s.reserved,
      available: s.total - s.reserved,
      warehouse: s.warehouse
    }))
  }))

  return NextResponse.json(formatted)
}
