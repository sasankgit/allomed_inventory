# Allo Inventory

Inventory reservation system built with Next.js, Prisma, Supabase, and Upstash Redis.

## Local Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Copy `.env.local` and fill in your values (see below)
4. Run migrations: `npx prisma migrate dev`
5. Seed the database: `npx prisma db seed`
6. Start dev server: `npm run dev`

## Environment Variables

DATABASE_URL=      # Supabase transaction pooler (port 6543)
DIRECT_URL=        # Supabase direct connection (port 5432)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

## How Expiry Works

Reservations expire after 10 minutes. Two mechanisms handle cleanup:
1. Vercel Cron runs every minute hitting `/api/cron/expire-reservations` which finds all pending reservations past their `expiresAt` and releases them
2. Lazy cleanup on the confirm endpoint — if you try to confirm an expired reservation it gets released and returns 410

## Concurrency

The reserve endpoint uses an atomic SQL UPDATE inside a Prisma transaction:
UPDATE Stock SET reserved = reserved + qty WHERE id = stockId AND (total - reserved) >= qty
If two requests race for the last unit, only one UPDATE affects a row. The other gets rowCount=0 and returns 409.

## Idempotency

Pass an `Idempotency-Key` header on POST /api/reservations. The response is cached in Redis for 24 hours. Retries with the same key return the original response without re-running the transaction.

## Trade-offs

- No authentication — in production each reservation would be tied to a user session
- No WebSockets — stock counts on the listing page don't update in real time for other users
- Single unit reservation only — multi-quantity would need a quantity selector UI
