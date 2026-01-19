import { createClient } from "./client"
import { v4 as uuidv4 } from "uuid"

const BUCKET_NAME = "listing-images"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export async function uploadListingImage(
  file: File,
  listingId: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<{ url: string; path: string } | null> {
  if (!file) return null

  // Validation
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, and WebP images are allowed")
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  const supabase = createClient()
  const fileExt = file.name.split(".").pop()
  const fileName = `${listingId}/${uuidv4()}.${fileExt}`

  try {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) throw error

    // Get public URL
    const { data: publicUrl } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

    return {
      url: publicUrl.publicUrl,
      path: data.path,
    }
  } catch (error) {
    console.error("Image upload error:", error)
    throw error
  }
}

export async function deleteListingImage(path: string): Promise<void> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

    if (error) throw error
  } catch (error) {
    console.error("Image deletion error:", error)
    throw error
  }
}

export async function getListingImages(listingId: string) {
  const supabase = createClient()

  try {
    const { data: images, error } = await supabase
      .from("listing_images")
      .select("*")
      .eq("listing_id", listingId)
      .order("display_order", { ascending: true })

    if (error) throw error
    return images || []
  } catch (error) {
    console.error("Error fetching listing images:", error)
    return []
  }
}
