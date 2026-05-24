import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const expired = await prisma.reservation.findMany({
    where: { status: 'pending', expiresAt: { lt: new Date() } }
  })

  for (const r of expired) {
    await prisma.$transaction([
      prisma.reservation.update({ where: { id: r.id }, data: { status: 'released' } }),
      prisma.stock.update({
        where: { id: r.stockId },
        data: { reserved: { decrement: r.quantity } }
      })
    ])
  }

  return NextResponse.json({ released: expired.length })
}
