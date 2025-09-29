'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface VehicleImageUploadProps {
  vehicleId: string
  currentImages: string[]
  onImagesUpdate: (images: string[]) => void
}

export default function VehicleImageUpload({ 
  vehicleId, 
  currentImages, 
  onImagesUpdate 
}: VehicleImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error('Please upload only image files')
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image size must be less than 5MB')
          continue
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${vehicleId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `vehicles/${fileName}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('vehicle-images')
          .upload(filePath, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          toast.error('Failed to upload image')
          continue
        }

        // Get public URL
        const { data } = supabase.storage
          .from('vehicle-images')
          .getPublicUrl(filePath)

        uploadedUrls.push(data.publicUrl)
      }

      if (uploadedUrls.length > 0) {
        const newImages = [...currentImages, ...uploadedUrls]
        onImagesUpdate(newImages)
        setPreviewImages([...previewImages, ...uploadedUrls])
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index)
    onImagesUpdate(newImages)
    setPreviewImages(previewImages.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Vehicle Images</h3>
        
        {/* Upload Button */}
        <div className="mb-6">
          <input
            type="file"
            id="image-upload"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading}
          />
          <label htmlFor="image-upload">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploading}
              asChild
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Images'}
              </span>
            </Button>
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Upload multiple images (max 5MB each). Supported formats: JPG, PNG, WebP
          </p>
        </div>

        {/* Current Images */}
        {currentImages.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Current Images ({currentImages.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Vehicle image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Images */}
        {previewImages.length > 0 && (
          <div className="space-y-4 mt-6">
            <h4 className="font-medium">New Images ({previewImages.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previewImages.map((image, index) => (
                <div key={`preview-${index}`} className="relative group">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {currentImages.length === 0 && previewImages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No images uploaded yet</p>
            <p className="text-sm">Upload images to showcase your vehicle</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
