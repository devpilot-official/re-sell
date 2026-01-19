import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import { Badge } from "@/components/ui/badge"

const ORDER_STATUSES = [
  { id: "payment_made", label: "Payment Made" },
  { id: "buyer_received_order", label: "Order Received" },
  { id: "buyer_processing", label: "Processing" },
  { id: "buyer_sent_order", label: "Sent Back" },
  { id: "courier_received", label: "Courier Received" },
  { id: "out_for_delivery", label: "Out for Delivery" },
  { id: "delivered", label: "Delivered" },
]

export default async function SalesPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: soldItems } = await supabase
    .from("transactions")
    .select(
      `
      *,
      listing:listings(title, price, category, id),
      buyer:profiles(full_name, buyer_rating, id)
    `,
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  const totalEarnings = soldItems?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0
  const paidOrders = soldItems?.filter((item: any) => item.status === "completed").length || 0

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Sales</h1>
            <div className="flex gap-8">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-primary">₦{totalEarnings.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid Orders</p>
                <p className="text-2xl font-bold text-primary">{paidOrders}</p>
              </div>
            </div>
          </div>
          <Link href="/dashboard/shop">
            <Button className="bg-primary hover:bg-primary/90">+ List New Item</Button>
          </Link>
        </div>

        {soldItems && soldItems.length > 0 ? (
          <div className="grid gap-4">
            {soldItems.map((item: any) => (
              <Card key={item.id} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{item.listing?.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">To: {item.buyer?.full_name}</p>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm font-medium">Order Status:</p>
                        <div className="flex flex-wrap gap-2">
                          {ORDER_STATUSES.map((status) => (
                            <button
                              key={status.id}
                              className={`px-3 py-1 rounded-full text-sm transition ${
                                item.order_status === status.id
                                  ? "bg-primary text-white"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">₦{item.amount.toLocaleString()}</p>
                      <Badge variant={item.status === "completed" ? "default" : "secondary"} className="mt-2">
                        {item.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 py-3 border-t border-b border-border mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Category</p>
                      <p className="text-sm">{item.listing?.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Order Date</p>
                      <p className="text-sm">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Payment Reference</p>
                      <p className="font-mono text-xs">{item.payment_reference}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Buyer Rating</p>
                      <p className="text-sm">{item.buyer?.buyer_rating || "No rating yet"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/dashboard/messages?listing=${item.listing?.id}`}>
                      <Button size="sm" variant="outline">
                        Message Buyer
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline">
                      Update Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/50 text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No items sold yet</p>
              <Link href="/dashboard/shop">
                <Button className="bg-primary hover:bg-primary/90">Start Selling</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
