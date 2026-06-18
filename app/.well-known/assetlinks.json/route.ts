import { NextResponse } from 'next/server'

export function GET() {
  const packageName = process.env.ANDROID_PACKAGE ?? 'com.wato.app'
  const sha256 = process.env.ANDROID_SHA256_FINGERPRINT ?? ''

  return NextResponse.json([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: packageName,
        sha256_cert_fingerprints: sha256 ? [sha256] : [],
      },
    },
  ])
}
