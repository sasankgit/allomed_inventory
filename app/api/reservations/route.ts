import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { z } from 'zod'

const ReserveSchema = z.object({
  stockId: z.string(),
  quantity: z.number().int().positive()
})

export async function POST(req: NextRequest) {
  const idempotencyKey = req.headers.get('Idempotency-Key')

  if (idempotencyKey) {
    const cached = await redis.get(idempotencyKey)
    if (cached) return NextResponse.json(cached, { status: 200 })
  }

  const body = await req.json()
  const parsed = ReserveSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { stockId, quantity } = parsed.data

  try {
    const reservation = await prisma.$transaction(async (tx) => {
      const updated = await tx.$executeRaw`
        UPDATE "Stock"
        SET reserved = reserved + ${quantity}
        WHERE id = ${stockId}
          AND (total - reserved) >= ${quantity}
      `

      if (updated === 0) throw new Error('INSUFFICIENT_STOCK')

      return tx.reservation.create({
        data: {
          stockId,
          quantity,
          status: 'pending',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          idempotencyKey: idempotencyKey ?? undefined
        },
        include: {
          stock: {
            include: { product: true, warehouse: true }
          }
        }
      })
    })

    if (idempotencyKey) {
      await redis.set(idempotencyKey, reservation, { ex: 86400 })
    }

    return NextResponse.json(reservation, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'INSUFFICIENT_STOCK') {
      return NextResponse.json({ error: 'Not enough stock available' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
