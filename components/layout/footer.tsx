import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto hidden md:block">
      <div className="container mx-auto flex items-center justify-between px-4 py-6 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Wato</p>
        <nav className="flex gap-4" aria-label="Footer">
          <Link href="/safety" className="hover:text-primary transition-colors">
            Safety
          </Link>
          <Link href="/legal/terms" className="hover:text-primary transition-colors">
            Terms
          </Link>
          <Link href="/legal/privacy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  )
}
