"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("transactions")
      .select("*, buyer:profiles(full_name, email), listing:listings(title)")
      .order("created_at", { ascending: false })
      .limit(100)

    if (!error) {
      setTransactions(data || [])
    }
    setLoading(false)
  }

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.buyer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) return <div>Loading...</div>

  const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">Monitor all platform transactions</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Platform Fee (5%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{Math.round(totalRevenue * 0.05).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Complete transaction history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by item or buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Item</th>
                  <th className="text-left py-3 px-4">Buyer</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium truncate">{tx.listing?.title || "—"}</td>
                    <td className="py-3 px-4">{tx.buyer?.full_name || "—"}</td>
                    <td className="py-3 px-4">₦{tx.amount?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={tx.status === "completed" ? "default" : "secondary"}>{tx.status}</Badge>
                    </td>
                    <td className="py-3 px-4">{new Date(tx.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
