import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { eventType, eventDescription, status } = await request.json()

    // Get user IP and user agent
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Log security event
    const { error } = await supabase.from("security_audit_logs").insert({
      user_id: user?.id || null,
      event_type: eventType,
      event_description: eventDescription,
      ip_address: ip,
      user_agent: userAgent,
      status: status || "success",
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Audit log error:", error)
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 })
  }
}
