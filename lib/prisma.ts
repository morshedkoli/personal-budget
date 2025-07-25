import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  
})

export { prisma }