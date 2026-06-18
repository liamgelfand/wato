import { NextResponse } from 'next/server'

export function GET() {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://wato.app'

  return NextResponse.json({
    applinks: {
      apps: [],
      details: [
        {
          appID: process.env.IOS_APP_ID ?? 'TEAMID.com.wato.app',
          paths: ['/challenge/*', '/attempt/*', '/users/*', '/teams/*'],
        },
      ],
    },
    webcredentials: {
      apps: [process.env.IOS_APP_ID ?? 'TEAMID.com.wato.app'],
    },
  })
}
