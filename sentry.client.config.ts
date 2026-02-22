// Sentry client configuration - OPTIONAL
// Only initializes if SENTRY_DSN is configured

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn,
      tracesSampleRate: 1,
      debug: false,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      integrations: [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      environment: process.env.NODE_ENV,
      ignoreErrors: [
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',
        'NetworkError',
        'Failed to fetch',
      ],
    })
  }).catch(() => {
    console.warn('Sentry initialization failed')
  })
} else if (process.env.NODE_ENV === 'production') {
  console.warn('⚠️  Sentry not configured - error tracking disabled')
}
