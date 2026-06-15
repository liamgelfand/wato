'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function CreateChallengePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'FITNESS',
    difficulty: 3,
  })

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    try {
      const response = await fetch('/api/challenges/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          setErrors(data.errors)
        } else {
          setErrors([data.error || 'Failed to create challenge'])
        }
        setLoading(false)
        return
      }

      toast.success('Challenge created successfully!')
      router.push(`/challenge/${data.id}`)
    } catch (error) {
      setErrors(['An error occurred. Please try again.'])
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Alert className="mb-6 border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <strong>Safety First:</strong> All challenges must be safe and appropriate. 
          Prohibited content includes: alcohol, drugs, self-harm, violence, weapons, 
          illegal activities, harassment, and dangerous stunts.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Create a Challenge</CardTitle>
          <CardDescription>
            Design a fun and safe challenge for the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Challenge Title *</Label>
              <Input
                id="title"
                placeholder="e.g., 30 Pushups in 1 Minute"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={100}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the challenge in detail. What does someone need to do? How should they prove it?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={500}
                rows={4}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={loading}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FITNESS">Fitness</SelectItem>
                    <SelectItem value="SKILL">Skill</SelectItem>
                    <SelectItem value="CREATIVITY">Creativity</SelectItem>
                    <SelectItem value="ADVENTURE">Adventure</SelectItem>
                    <SelectItem value="FUNNY">Funny</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">
                  Difficulty: {formData.difficulty}/5
                </Label>
                <input
                  id="difficulty"
                  type="range"
                  min="1"
                  max="5"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                  className="wato-range w-full"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Points: {10 * formData.difficulty}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Challenge'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
