import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/header"
import { Badge } from "@/components/ui/badge"

export default async function AccountDetailsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Account Details</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                <p className="font-semibold">{profile?.full_name || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-semibold">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <p className="font-semibold">{profile?.phone || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-semibold">{profile?.location || "Not set"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Account Status</p>
                <Badge variant={profile?.verified ? "default" : "secondary"}>
                  {profile?.verified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Seller Rating</p>
                <p className="text-2xl font-bold text-primary">{profile?.seller_rating || "0.00"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Buyer Rating</p>
                <p className="text-2xl font-bold text-primary">{profile?.buyer_rating || "0.00"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-primary">{profile?.total_sales || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Purchases</p>
                <p className="text-3xl font-bold text-primary">{profile?.total_purchases || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                <p className="text-lg font-semibold">{new Date(profile?.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
