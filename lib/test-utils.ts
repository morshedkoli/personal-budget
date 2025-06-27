export function createMockRequest(options: {
  method?: string
  body?: any
  headers?: Record<string, string>
  url?: string
}) {
  return {
    method: options.method || 'GET',
    json: async () => options.body || {},
    headers: new Map(Object.entries(options.headers || {})),
    nextUrl: new URL(options.url || 'http://localhost:3000')
  } as any
}

export function createMockUser() {
  return {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'USER'
  }
}