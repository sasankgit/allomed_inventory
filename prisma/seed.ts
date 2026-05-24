import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig, Pool } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws
const pool = new Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaNeon(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.reservation.deleteMany()
  await prisma.stock.deleteMany()
  await prisma.product.deleteMany()
  await prisma.warehouse.deleteMany()

  const mumbai = await prisma.warehouse.create({
    data: { name: 'Mumbai Central', city: 'Mumbai' }
  })
  const delhi = await prisma.warehouse.create({
    data: { name: 'Delhi North', city: 'Delhi' }
  })

  const shoe = await prisma.product.create({
    data: { name: 'Running Shoes', sku: 'SHOE-001', price: 2999.0 }
  })
  const tshirt = await prisma.product.create({
    data: { name: 'Graphic T-Shirt', sku: 'TSHIRT-001', price: 799.0 }
  })
  const bag = await prisma.product.create({
    data: { name: 'Backpack', sku: 'BAG-001', price: 1499.0 }
  })

  await prisma.stock.createMany({
    data: [
      { productId: shoe.id, warehouseId: mumbai.id, total: 10 },
      { productId: shoe.id, warehouseId: delhi.id, total: 2 },
      { productId: tshirt.id, warehouseId: mumbai.id, total: 20 },
      { productId: tshirt.id, warehouseId: delhi.id, total: 3 },
      { productId: bag.id, warehouseId: mumbai.id, total: 7 },
      { productId: bag.id, warehouseId: delhi.id, total: 1 },
    ]
  })

  console.log('✅ Seeded successfully')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
