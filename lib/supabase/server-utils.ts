import { createServerClient } from "./server"

export async function getCurrentUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) throw error
  return data
}

export async function logAdminAction(
  adminId: string,
  action: string,
  targetTable: string,
  targetId?: string,
  changes?: Record<string, any>,
) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action,
    target_table: targetTable,
    target_id: targetId,
    changes,
    ip_address: "SERVER",
  })

  if (error) {
    console.error("Failed to log admin action:", error)
  }
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = await createServerClient()
  const { data } = await supabase.from("profiles").select("admin_role").eq("id", userId).single()

  return data?.admin_role === "admin"
}
