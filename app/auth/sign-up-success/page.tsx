import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md">
        <Card className="border-border/50 border-2 border-primary/30">
          <CardHeader className="text-center">
            <div className="text-5xl mb-4">✓</div>
            <CardTitle className="text-2xl">Verification Email Sent</CardTitle>
            <CardDescription>Check your email to confirm your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              We&apos;ve sent a verification link to your email address. Click the link to activate your account and
              start selling or buying.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Tip:</strong> Check your spam folder if you don&apos;t see the email within a few minutes.
              </p>
            </div>
            <Link href="/" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90">Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
