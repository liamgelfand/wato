import { Shield, AlertTriangle, CheckCircle, Flag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SAFETY_GUIDELINES } from '@/lib/moderation'

export default function SafetyPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Safety Guidelines
        </h1>
        <p className="text-muted-foreground">
          Wato is committed to providing a safe and positive environment
        </p>
      </div>

      <Alert className="mb-6 border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription>
          <strong>Safety First:</strong> All challenges and activities on Wato must be safe, legal, and appropriate for all ages.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Allowed Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Physical fitness and sports activities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Creative arts and crafts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Learning new skills and hobbies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Fun and safe adventures</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Harmless and appropriate humor</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Acts of kindness and community service</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Prohibited Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>Alcohol, drugs, or controlled substances</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>Self-harm or dangerous activities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>Violence or fighting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>Weapons of any kind</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>Illegal activities (theft, trespassing, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>Harassment, bullying, or hate speech</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>Sexual or inappropriate content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>Dangerous stunts or high-risk activities</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Reporting Violations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            If you encounter content that violates our safety guidelines, please report it immediately using the "Report" button. Our moderation team reviews all reports within 24 hours.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">What happens when you report?</p>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>Your report is submitted anonymously</li>
              <li>Our moderation team reviews the content</li>
              <li>Appropriate action is taken (warning, content removal, or ban)</li>
              <li>The community remains safe for everyone</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Consequences of Violations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Users who violate our safety guidelines may face the following consequences:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="font-semibold">First violation:</span>
              <span>Warning and content removal</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">Second violation:</span>
              <span>Temporary suspension (7-30 days)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">Severe violations:</span>
              <span>Immediate permanent ban</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stay Safe, Have Fun!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Remember, the goal of Wato is to have fun, challenge yourself, and connect with friends in a positive way. Always:
          </p>
          <ul className="space-y-2 text-sm">
            <li>• Use common sense and good judgment</li>
            <li>• Never attempt a challenge that makes you uncomfortable</li>
            <li>• Consider the safety of yourself and others</li>
            <li>• Be respectful and supportive of the community</li>
            <li>• Report anything that seems unsafe or inappropriate</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
