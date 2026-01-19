"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { getAvailablePaymentMethods, calculateFees, type PaymentMethod } from "@/lib/payments/payment-provider"

interface PaymentMethodsProps {
  amount: number
  currency: string
  selectedMethod: string | null
  onMethodSelect: (method: string) => void
  onInitiatePayment: (method: string) => void
}

export default function PaymentMethods({
  amount,
  currency,
  selectedMethod,
  onMethodSelect,
  onInitiatePayment,
}: PaymentMethodsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const availableMethods = getAvailablePaymentMethods(currency)

  const handlePayment = async () => {
    if (!selectedMethod) return
    setIsProcessing(true)
    try {
      onInitiatePayment(selectedMethod)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>Select your preferred payment option</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedMethod || ""} onValueChange={onMethodSelect}>
          <div className="space-y-3">
            {availableMethods.map((method: PaymentMethod) => {
              const fees = calculateFees(amount, method)
              return (
                <div
                  key={method.type}
                  className="flex items-start space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition"
                >
                  <RadioGroupItem value={method.type} id={method.type} className="mt-1" />
                  <Label htmlFor={method.type} className="flex-1 cursor-pointer">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {method.icon} {method.displayName}
                      </p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                      {method.minAmount && (
                        <p className="text-xs text-muted-foreground">
                          Min: {method.minAmount.toLocaleString()} • Max: {method.maxAmount?.toLocaleString()}
                        </p>
                      )}
                      <p className="text-sm font-medium pt-2">
                        Total: ₦{fees.totalAmount.toLocaleString()} (Fee: ₦{fees.feeAmount.toLocaleString()})
                      </p>
                    </div>
                  </Label>
                </div>
              )
            })}
          </div>
        </RadioGroup>

        <div className="pt-4 space-y-2">
          <Button
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isProcessing ? "Processing..." : "Continue to Payment"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">Your payment is secured and encrypted</p>
        </div>
      </CardContent>
    </Card>
  )
}
