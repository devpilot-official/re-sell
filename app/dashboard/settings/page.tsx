"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { LANGUAGES, CURRENCIES, type LanguageCode, type CurrencyCode } from "@/lib/i18n/config"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [preferences, setPreferences] = useState({
    preferred_language: "en" as LanguageCode,
    preferred_currency: "NGN" as CurrencyCode,
    notification_email: true,
    notification_sms: false,
    receive_promotions: true,
    receive_messages: true,
  })

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

    if (data && !error) {
      setPreferences(data)
    }
  }

  const handleSave = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setMessage({ type: "success", text: "Preferences saved successfully" })
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save preferences",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Language and Currency */}
      <Card>
        <CardHeader>
          <CardTitle>Localization</CardTitle>
          <CardDescription>Choose your preferred language and currency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              value={preferences.preferred_language}
              onChange={(e) => setPreferences({ ...preferences, preferred_language: e.target.value as LanguageCode })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              {Object.entries(LANGUAGES).map(([code, lang]) => (
                <option key={code} value={code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <select
              id="currency"
              value={preferences.preferred_currency}
              onChange={(e) => setPreferences({ ...preferences, preferred_currency: e.target.value as CurrencyCode })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              {Object.entries(CURRENCIES).map(([code, curr]) => (
                <option key={code} value={code}>
                  {curr.symbol} {curr.name} ({curr.code})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Control how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.notification_email}
              onCheckedChange={(checked) => setPreferences({ ...preferences, notification_email: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
            </div>
            <Switch
              id="sms-notifications"
              checked={preferences.notification_sms}
              onCheckedChange={(checked) => setPreferences({ ...preferences, notification_sms: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="promotions">Marketing & Promotions</Label>
              <p className="text-sm text-muted-foreground">Receive promotional offers</p>
            </div>
            <Switch
              id="promotions"
              checked={preferences.receive_promotions}
              onCheckedChange={(checked) => setPreferences({ ...preferences, receive_promotions: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="messages">Message Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified of new messages</p>
            </div>
            <Switch
              id="messages"
              checked={preferences.receive_messages}
              onCheckedChange={(checked) => setPreferences({ ...preferences, receive_messages: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90">
        {isLoading ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  )
}
