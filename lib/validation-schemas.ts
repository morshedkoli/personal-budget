import { z } from 'zod'

export const userSchemas = {
  register: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters')
  }),
  
  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  })
}

export const transactionSchemas = {
  create: z.object({
    amount: z.number().positive('Amount must be positive'),
    description: z.string().optional(),
    date: z.string().datetime('Invalid date format'),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
    categoryId: z.string().min(1, 'Category is required')
  })
}