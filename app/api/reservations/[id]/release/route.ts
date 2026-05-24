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
    return NextResponse.json({ error: `Cannot release a ${reservation.status} reservation` }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.reservation.update({ where: { id }, data: { status: 'released' } }),
    prisma.stock.update({
      where: { id: reservation.stockId },
      data: { reserved: { decrement: reservation.quantity } }
    })
  ])

  return NextResponse.json({ message: 'Released successfully' })
}
