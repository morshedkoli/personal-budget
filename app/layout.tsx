import type { Metadata } from 'next' // Add this import
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Personal Finance Tracker',
  description: 'Track your income, expenses, assets, and liabilities with ease',
  keywords: 'finance, budget, expense tracker, personal finance, money management',
  authors: [{ name: 'Personal Finance Tracker' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}