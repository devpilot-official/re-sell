import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProfileForm from "@/components/profile/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <a href="/dashboard" className="text-2xl font-bold text-primary">
              Preloved
            </a>
            <div className="flex items-center gap-4">
              <form action="/auth/logout" method="POST">
                <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
        <ProfileForm profile={profile} userId={user.id} />
      </div>
    </div>
  )
}
