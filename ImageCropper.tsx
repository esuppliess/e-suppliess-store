import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RotateCw, ZoomIn, Check, X } from 'lucide-react';

interface ImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropper({ open, onOpenChange, imageSrc, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(1);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect || 1));
  }, [aspect]);

  const getCroppedImage = useCallback(async (): Promise<Blob | null> => {
    const image = imgRef.current;
    if (!image || !completedCrop) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    const rotateRads = (rotate * Math.PI) / 180;
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    // Move the crop origin to the canvas origin (0,0)
    ctx.translate(-cropX, -cropY);
    // Move the origin to the center of the original position
    ctx.translate(centerX, centerY);
    // Rotate around the origin
    ctx.rotate(rotateRads);
    // Scale the image
    ctx.scale(scale, scale);
    // Move the center of the image to the origin (0,0)
    ctx.translate(-centerX, -centerY);

    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight
    );

    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.9
      );
    });
  }, [completedCrop, scale, rotate]);

  const handleApply = async () => {
    const croppedBlob = await getCroppedImage();
    if (croppedBlob) {
      onCropComplete(croppedBlob);
      onOpenChange(false);
      // Reset state
      setScale(1);
      setRotate(0);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setScale(1);
    setRotate(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Crop & Adjust Image</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {/* Crop Area */}
          <div className="flex justify-center bg-accent/50 rounded-lg p-4 min-h-[300px]">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="max-h-[400px]"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                style={{
                  transform: `scale(${scale}) rotate(${rotate}deg)`,
                  maxHeight: '400px',
                  width: 'auto',
                }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </div>

          {/* Controls */}
          <div className="space-y-4 mt-6">
            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Aspect Ratio</Label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'Free', value: undefined },
                  { label: '1:1', value: 1 },
                  { label: '4:3', value: 4 / 3 },
                  { label: '16:9', value: 16 / 9 },
                  { label: '3:4', value: 3 / 4 },
                ].map((ratio) => (
                  <Button
                    key={ratio.label}
                    type="button"
                    size="sm"
                    variant={aspect === ratio.value ? 'default' : 'outline'}
                    onClick={() => {
                      setAspect(ratio.value);
                      if (imgRef.current && ratio.value) {
                        const { width, height } = imgRef.current;
                        setCrop(centerAspectCrop(width, height, ratio.value));
                      }
                    }}
                  >
                    {ratio.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Zoom */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Zoom</Label>
                <span className="text-xs text-muted-foreground ml-auto">{Math.round(scale * 100)}%</span>
              </div>
              <Slider
                value={[scale]}
                onValueChange={([v]) => setScale(v)}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RotateCw className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Rotation</Label>
                <span className="text-xs text-muted-foreground ml-auto">{rotate}°</span>
              </div>
              <Slider
                value={[rotate]}
                onValueChange={([v]) => setRotate(v)}
                min={-180}
                max={180}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="button" onClick={handleApply}>
            <Check className="h-4 w-4 mr-2" />
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
