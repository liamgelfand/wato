// Sentry edge configuration - OPTIONAL
// Only initializes if SENTRY_DSN is configured

const dsn = process.env.SENTRY_DSN

if (dsn) {
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn,
      tracesSampleRate: 1,
      debug: false,
      environment: process.env.NODE_ENV,
    })
  }).catch(() => {
    console.warn('Sentry edge initialization failed')
  })
}
