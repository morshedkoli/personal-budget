import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  transactionAlerts: z.boolean(),
  monthlyReports: z.boolean(),
  budgetAlerts: z.boolean(),
})

const appSettingsSchema = z.object({
  currency: z.string(),
  dateFormat: z.string(),
  theme: z.string(),
  language: z.string(),
})

const updateSettingsSchema = z.object({
  type: z.enum(['notifications', 'app']),
  settings: z.union([notificationSettingsSchema, appSettingsSchema]),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user settings from database
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: user.userId },
    })

    // Default settings if none exist
    const defaultSettings = {
      notifications: {
        emailNotifications: true,
        transactionAlerts: true,
        monthlyReports: false,
        budgetAlerts: true,
      },
      app: {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        theme: 'system',
        language: 'en',
      },
    }

    if (!userSettings) {
      return NextResponse.json(defaultSettings)
    }

    const settings = {
      notifications: {
        emailNotifications: userSettings.emailNotifications,
        transactionAlerts: userSettings.transactionAlerts,
        monthlyReports: userSettings.monthlyReports,
        budgetAlerts: userSettings.budgetAlerts,
      },
      app: {
        currency: userSettings.currency,
        dateFormat: userSettings.dateFormat,
        theme: userSettings.theme,
        language: userSettings.language,
      },
    }

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSettingsSchema.parse(body)

    // Get existing settings or create default
    let userSettings = await prisma.userSettings.findUnique({
      where: { userId: user.userId },
    })

    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: {
          userId: user.userId,
          emailNotifications: true,
          transactionAlerts: true,
          monthlyReports: false,
          budgetAlerts: true,
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          theme: 'system',
          language: 'en',
        },
      })
    }

    // Update settings based on type
    let updateData: any = {}

    if (validatedData.type === 'notifications') {
      const notificationSettings = validatedData.settings as z.infer<typeof notificationSettingsSchema>
      updateData = {
        emailNotifications: notificationSettings.emailNotifications,
        transactionAlerts: notificationSettings.transactionAlerts,
        monthlyReports: notificationSettings.monthlyReports,
        budgetAlerts: notificationSettings.budgetAlerts,
      }
    } else if (validatedData.type === 'app') {
      const appSettings = validatedData.settings as z.infer<typeof appSettingsSchema>
      updateData = {
        currency: appSettings.currency,
        dateFormat: appSettings.dateFormat,
        theme: appSettings.theme,
        language: appSettings.language,
      }
    }

    const updatedSettings = await prisma.userSettings.update({
      where: { userId: user.userId },
      data: updateData,
    })

    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}