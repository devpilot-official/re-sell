import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { listingId, amount, paymentMethod, currency } = await request.json()

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: listingId, // Will be fetched from listing
        price: amount,
        currency,
        payment_method: paymentMethod,
        status: "pending",
      })
      .select()
      .single()

    if (txError) throw txError

    // Route to appropriate payment provider
    let redirectUrl = ""

    switch (paymentMethod) {
      case "card":
      case "bank_transfer":
      case "ussd":
        redirectUrl = `/checkout/paystack/${transaction.id}`
        break
      case "mobile_money":
      case "crypto":
        redirectUrl = `/checkout/flutterwave/${transaction.id}`
        break
      default:
        return NextResponse.json({ error: "Unknown payment method" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      redirectUrl,
    })
  } catch (error) {
    console.error("Payment initiation error:", error)
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 })
  }
}
