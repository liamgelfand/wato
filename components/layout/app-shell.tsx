'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './navbar'
import { MobileNav } from './mobile-nav'
import { Footer } from './footer'

const AUTH_ROUTES = ['/login', '/register']

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  if (isAuthRoute) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] pb-20 md:pb-0 flex flex-col">
        {children}
        <Footer />
      </main>
      <MobileNav />
    </>
  )
}
