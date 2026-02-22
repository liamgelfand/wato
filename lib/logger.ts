/**
 * Structured logging with Pino
 * Production-grade logging for debugging and monitoring
 */

import pino from 'pino'

// Create logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  
  // Pretty print in development
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,

  // Production formatting
  formatters:
    process.env.NODE_ENV === 'production'
      ? {
          level: (label) => {
            return { level: label }
          },
        }
      : undefined,

  // Base metadata
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.VERCEL_GIT_COMMIT_SHA,
  },
})

// Helper functions for common log patterns
export const loggers = {
  auth: logger.child({ module: 'auth' }),
  api: logger.child({ module: 'api' }),
  db: logger.child({ module: 'database' }),
  storage: logger.child({ module: 'storage' }),
  moderation: logger.child({ module: 'moderation' }),
  points: logger.child({ module: 'points' }),
}

// Usage examples:
// logger.info('User logged in', { userId, email })
// logger.error('Payment failed', { error, userId, amount })
// logger.warn('Rate limit exceeded', { ip, endpoint })
// loggers.auth.info('Password reset requested', { email })
