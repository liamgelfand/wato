// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// Sentry is OPTIONAL - it will only initialize if SENTRY_DSN is configured
// This allows the app to work without Sentry for local development

export function initSentry() {
  // Sentry is optional - only initialize if DSN is provided
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
  
  if (!dsn) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.')
    }
    return
  }

  // Dynamically import Sentry only if configured
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn,
      tracesSampleRate: 1.0,
      debug: false,
      environment: process.env.NODE_ENV,
    })
  }).catch((error) => {
    console.warn('Failed to initialize Sentry:', error)
  })
}

// Auto-initialize
if (typeof window !== 'undefined') {
  initSentry()
}
