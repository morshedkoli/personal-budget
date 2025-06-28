import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url('Invalid DATABASE_URL'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXTAUTH_URL: z.string().url().optional(),
  EMAIL_FROM: z.string().email().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
})

// Use safeParse to avoid throwing during build time
const envResult = envSchema.safeParse(process.env)
export const env = envResult.success ? envResult.data : {} as any

export function getEnvironmentStatus() {
  try {
    const parsedEnv = envSchema.safeParse(process.env)
    
    // Determine database type and configuration
    const databaseUrl = process.env.DATABASE_URL || ''
    const isMongoDb = databaseUrl.includes('mongodb')
    const isSqlite = databaseUrl.includes('sqlite') || databaseUrl.includes('.db')
    const isLocal = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
    
    const databaseType = isMongoDb ? 'mongodb' : isSqlite ? 'sqlite' : 'unknown'
    const databaseSuggestions = []
    
    if (isLocal && process.env.NODE_ENV === 'production') {
      databaseSuggestions.push('Consider using a cloud database for production')
    }
    
    if (!parsedEnv.success) {
      return {
        isValid: false,
        error: parsedEnv.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', '),
        environment: process.env.NODE_ENV || 'development',
        database: {
          type: databaseType,
          isLocal,
          suggestions: databaseSuggestions
        },
        email: {
          hasGmail: false,
          hasSendGrid: false,
          hasCustomSMTP: false,
          hasEthereal: false,
          hasAnyMethod: false
        }
      }
    }

    const env = parsedEnv.data
    
    // Check email configuration
    const hasGmail = !!(env.EMAIL_FROM && env.EMAIL_FROM.includes('gmail.com'))
    const hasSendGrid = !!(process.env.SENDGRID_API_KEY)
    const hasCustomSMTP = !!(env.SMTP_HOST && env.SMTP_PORT)
    const hasEthereal = !!(process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS)
    const hasAnyMethod = hasGmail || hasSendGrid || hasCustomSMTP || hasEthereal
    
    return {
      isValid: true,
      error: null,
      environment: env.NODE_ENV,
      database: {
        type: databaseType,
        isLocal,
        suggestions: databaseSuggestions
      },
      email: {
        hasGmail,
        hasSendGrid,
        hasCustomSMTP,
        hasEthereal,
        hasAnyMethod
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
      environment: process.env.NODE_ENV || 'development',
      database: {
        type: 'unknown',
        isLocal: false,
        suggestions: []
      },
      email: {
        hasGmail: false,
        hasSendGrid: false,
        hasCustomSMTP: false,
        hasEthereal: false,
        hasAnyMethod: false
      }
    }
  }
}