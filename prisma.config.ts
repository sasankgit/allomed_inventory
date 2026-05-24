import { defineConfig } from 'prisma/config'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig, Pool } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  migrate: {
    async adapter() {
      const pool = new Pool({ connectionString: process.env.DIRECT_URL })
      return new PrismaNeon(pool)
    }
  }
})
