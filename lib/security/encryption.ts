// Encryption utilities for sensitive data
import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-change-in-production"

export function encryptData(data: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.padEnd(32, "0"), "utf8"), iv)

  let encrypted = cipher.update(data, "utf8", "hex")
  encrypted += cipher.final("hex")

  return `${iv.toString("hex")}:${encrypted}`
}

export function decryptData(encryptedData: string): string {
  const [ivHex, encrypted] = encryptedData.split(":")
  const iv = Buffer.from(ivHex, "hex")

  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.padEnd(32, "0"), "utf8"), iv)

  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}
