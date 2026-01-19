import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md">
        <Card className="border-border/50 border-2 border-destructive/30">
          <CardHeader className="text-center">
            <div className="text-5xl mb-4">⚠</div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {params?.error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{params.error}</p>}
            <p className="text-sm text-muted-foreground text-center">
              Something went wrong during authentication. Please try again.
            </p>
            <Link href="/auth/login" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90">Return to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
