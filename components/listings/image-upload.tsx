"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { uploadListingImage, deleteListingImage } from "@/lib/supabase/storage"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

interface ImageUploadProps {
  listingId: string
  onImagesUpdate: (images: Array<{ id: string; image_url: string; is_primary: boolean }>) => void
}

export default function ImageUpload({ listingId, onImagesUpdate }: ImageUploadProps) {
  const [images, setImages] = useState<
    Array<{ id: string; image_url: string; storage_path: string; is_primary: boolean }>
  >([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const uploadedImages = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Upload to storage
        const result = await uploadListingImage(file, listingId)
        if (!result) continue

        // Save image metadata to database
        const { data: imageData, error: dbError } = await supabase
          .from("listing_images")
          .insert({
            listing_id: listingId,
            image_url: result.url,
            storage_path: result.path,
            is_primary: images.length === 0 && i === 0, // First image is primary
            uploaded_by: (await supabase.auth.getUser()).data.user?.id,
            display_order: images.length + i,
          })
          .select()
          .single()

        if (dbError) throw dbError
        uploadedImages.push(imageData)
      }

      setImages([...images, ...uploadedImages])
      onImagesUpdate([...images, ...uploadedImages])

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload images")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteImage = async (imageId: string, storagePath: string) => {
    try {
      const supabase = createClient()

      // Delete from storage
      await deleteListingImage(storagePath)

      // Delete from database
      await supabase.from("listing_images").delete().eq("id", imageId)

      const updatedImages = images.filter((img) => img.id !== imageId)
      setImages(updatedImages)
      onImagesUpdate(updatedImages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image")
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    try {
      const supabase = createClient()

      // Update all images to not primary
      await supabase.from("listing_images").update({ is_primary: false }).eq("listing_id", listingId)

      // Set this image as primary
      await supabase.from("listing_images").update({ is_primary: true }).eq("id", imageId)

      const updatedImages = images.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
      }))
      setImages(updatedImages)
      onImagesUpdate(updatedImages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update primary image")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
              <div className="space-y-2">
                <div className="text-4xl">📸</div>
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">PNG, JPG or WebP up to 5MB each. Max 10 images.</p>
              </div>
            </div>

            {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

            {isUploading && <div className="text-center py-4 text-muted-foreground">Uploading images...</div>}

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={image.image_url || "/placeholder.svg"}
                        alt="Listing image"
                        fill
                        className="object-cover"
                      />
                    </div>
                    {image.is_primary && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                        Primary
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      {!image.is_primary && (
                        <Button size="sm" variant="secondary" onClick={() => handleSetPrimary(image.id)}>
                          Set Primary
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(image.id, image.storage_path)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
