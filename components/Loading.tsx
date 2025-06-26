'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
  className?: string
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 dark:text-blue-400`} />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400 font-medium`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

// Skeleton loading components for better UX
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
    </div>
  </div>
)

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="animate-pulse">
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-300 dark:bg-gray-600 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-400 dark:bg-gray-500 rounded"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-300 dark:divide-gray-600">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export const SkeletonChart: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg p-6 ${className}`}>
    <div className="space-y-4">
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
      <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
      <div className="flex justify-center space-x-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      </div>
    </div>
  </div>
)

// Button loading state
export const LoadingButton: React.FC<{
  loading: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}> = ({ loading, children, className = '', disabled, onClick, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading || disabled}
    className={`inline-flex items-center justify-center space-x-2 ${className} ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    <span>{children}</span>
  </button>
)

// Page loading wrapper
export const PageLoading: React.FC<{ 
  loading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}> = ({ loading, children, fallback }) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {fallback || <Loading size="lg" text="Loading page..." />}
      </div>
    )
  }
  
  return <>{children}</>
}

export default Loading