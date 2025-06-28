import { NextResponse } from 'next/server'

export function successResponse<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message
  })
}

export function errorResponse(message: string, statusCode = 400, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code
    },
    { status: statusCode }
  )
}