import { useState, useRef } from 'react';
import { Upload, X, GripVertical, Loader2, Crop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ImageCropper } from './ImageCropper';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  bucket: 'product-images' | 'site-assets';
  maxImages?: number;
}

export function ImageUploader({ 
  images, 
  onImagesChange, 
  bucket,
  maxImages = 6 
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropImageIndex, setCropImageIndex] = useState<number | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split('.').pop() || 'jpg'}`;
    const filePath = bucket === 'product-images' ? `products/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { contentType: file.type });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast({
        title: 'Maximum images reached',
        description: `You can only upload up to ${maxImages} images.`,
        variant: 'destructive',
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // Validate all files
    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: `"${file.name}" is not an image file.`,
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `"${file.name}" exceeds 10MB limit.`,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsUploading(true);

    try {
      const uploadPromises = filesToUpload.map(file => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      const successfulUrls = results.filter((url): url is string => url !== null);

      if (successfulUrls.length > 0) {
        onImagesChange([...images, ...successfulUrls]);
        toast({
          title: 'Upload successful',
          description: `${successfulUrls.length} image${successfulUrls.length > 1 ? 's' : ''} uploaded.`,
        });
      }

      if (successfulUrls.length < filesToUpload.length) {
        toast({
          title: 'Some uploads failed',
          description: `${filesToUpload.length - successfulUrls.length} image(s) failed to upload.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your images.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropImage = (index: number) => {
    setCropImageIndex(index);
    setCropImageSrc(images[index]);
    setCropperOpen(true);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (cropImageIndex === null) return;
    setIsUploading(true);

    try {
      // Upload cropped image
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
      const filePath = bucket === 'product-images' ? `products/${fileName}` : fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, croppedBlob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Try to delete old image
      const oldUrl = images[cropImageIndex];
      try {
        const url = new URL(oldUrl);
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
        if (pathMatch) {
          const [, bucketName, oldFilePath] = pathMatch;
          await supabase.storage.from(bucketName).remove([oldFilePath]);
        }
      } catch { /* ignore */ }

      // Replace image in array
      const newImages = [...images];
      newImages[cropImageIndex] = publicUrl;
      onImagesChange(newImages);

      toast({ title: 'Image cropped', description: 'Your cropped image has been saved.' });
    } catch (error) {
      console.error('Crop upload error:', error);
      toast({
        title: 'Crop failed',
        description: 'There was an error saving the cropped image.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setCropImageIndex(null);
      setCropImageSrc('');
    }
  };

  const handleCropperClose = (open: boolean) => {
    if (!open) {
      setCropImageIndex(null);
      setCropImageSrc('');
    }
    setCropperOpen(open);
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index];
    try {
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
      if (pathMatch) {
        const [, bucketName, filePath] = pathMatch;
        await supabase.storage.from(bucketName).remove([filePath]);
      }
    } catch { /* ignore */ }

    onImagesChange(images.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    onImagesChange(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading || images.length >= maxImages}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || images.length >= maxImages}
          className="w-full h-24 border-dashed"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              Upload Images ({images.length}/{maxImages})
            </>
          )}
        </Button>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url, index) => (
            <div
              key={url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'relative aspect-square bg-accent rounded-lg overflow-hidden group cursor-move',
                index === 0 && 'ring-2 ring-foreground',
                draggedIndex === index && 'opacity-50'
              )}
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {index === 0 && (
                <span className="absolute top-1 left-1 text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
              
              <div className="absolute top-1 right-14 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-foreground drop-shadow-md" />
              </div>

              {/* Crop Button */}
              <button
                type="button"
                onClick={() => handleCropImage(index)}
                className="absolute top-1 right-7 h-6 w-6 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground"
                title="Crop image"
              >
                <Crop className="h-3 w-3" />
              </button>
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 h-6 w-6 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Select multiple images at once. Drag to reorder. Click crop icon to adjust. First image is primary.
      </p>

      {/* Image Cropper Dialog */}
      {cropImageSrc && (
        <ImageCropper
          open={cropperOpen}
          onOpenChange={handleCropperClose}
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
