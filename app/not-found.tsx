import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-md p-4 flex items-center justify-center min-h-[50vh]">
      <Card className="w-full text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-primary">404</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">This page doesn&apos;t exist.</p>
          <Button asChild className="w-full">
            <Link href="/">Back to Feed</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
