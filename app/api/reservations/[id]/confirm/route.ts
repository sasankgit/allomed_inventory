import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const reservation = await prisma.reservation.findUnique({ where: { id } })

  if (!reservation) {
    return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
  }

  if (reservation.status !== 'pending') {
    return NextResponse.json({ error: `Reservation is already ${reservation.status}` }, { status: 400 })
  }

  if (new Date() > reservation.expiresAt) {
    await prisma.$transaction([
      prisma.reservation.update({ where: { id }, data: { status: 'released' } }),
      prisma.stock.update({
        where: { id: reservation.stockId },
        data: { reserved: { decrement: reservation.quantity } }
      })
    ])
    return NextResponse.json({ error: 'Reservation has expired' }, { status: 410 })
  }

  await prisma.$transaction([
    prisma.reservation.update({ where: { id }, data: { status: 'confirmed' } }),
    prisma.stock.update({
      where: { id: reservation.stockId },
      data: {
        total: { decrement: reservation.quantity },
        reserved: { decrement: reservation.quantity }
      }
    })
  ])

  const confirmed = await prisma.reservation.findUnique({
    where: { id },
    include: { stock: { include: { product: true, warehouse: true } } }
  })

  return NextResponse.json(confirmed)
}
