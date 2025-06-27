type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class Logger {
  private log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(logEntry, null, 2))
    } else {
      console.log(JSON.stringify(logEntry))
    }
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta)
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta)
  }

  error(message: string, error?: Error, meta?: any) {
    this.log('error', message, {
      error: error?.message,
      stack: error?.stack,
      ...meta
    })
  }
}

export const logger = new Logger()