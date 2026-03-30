import { useState, useRef } from 'react';
import { Upload, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useSiteSettings, useUpdateSiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const { toast } = useToast();
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (PNG, JPG, SVG).',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Logo must be under 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Delete old logo if exists
      if (settings.logo_url) {
        try {
          const url = new URL(settings.logo_url);
          const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/site-assets\/(.+)/);
          if (pathMatch) {
            await supabase.storage.from('site-assets').remove([pathMatch[1]]);
          }
        } catch (err) {
          // Silently fail
        }
      }

      // Upload new logo
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      // Update settings
      await updateSettings.mutateAsync({
        id: settings.id,
        logo_url: publicUrl,
      });

      toast({
        title: 'Logo updated',
        description: 'Your new logo is now live across the site.',
      });

    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!settings) return;

    try {
      // Delete from storage
      if (settings.logo_url) {
        try {
          const url = new URL(settings.logo_url);
          const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/site-assets\/(.+)/);
          if (pathMatch) {
            await supabase.storage.from('site-assets').remove([pathMatch[1]]);
          }
        } catch (err) {
          // Silently fail
        }
      }

      // Update settings
      await updateSettings.mutateAsync({
        id: settings.id,
        logo_url: null,
      });

      toast({
        title: 'Logo removed',
        description: 'The text logo "E SUPPLIES" will be displayed instead.',
      });

    } catch (error: any) {
      toast({
        title: 'Failed to remove logo',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">Loading settings...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Logo & Settings</h1>
          <p className="text-muted-foreground">
            Customize your store's branding
          </p>
        </div>

        <Card className="border-border max-w-xl">
          <CardHeader>
            <CardTitle>Store Logo</CardTitle>
            <CardDescription>
              Upload your logo to display in the header and footer. Recommended size: 200x60px. Supports PNG, JPG, or SVG.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Logo Preview */}
            <div className="bg-accent rounded-lg p-8 flex items-center justify-center min-h-[120px]">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt="Store Logo"
                  className="max-h-16 max-w-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No logo uploaded. Using text: "E SUPPLIES"
                  </p>
                </div>
              )}
            </div>

            {/* Upload / Remove Buttons */}
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {settings?.logo_url ? 'Replace Logo' : 'Upload Logo'}
                  </>
                )}
              </Button>
              {settings?.logo_url && (
                <Button
                  variant="outline"
                  onClick={handleRemoveLogo}
                  disabled={updateSettings.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>

            {/* Preview Locations */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium mb-2">Logo will appear in:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Header (center position)</li>
                <li>• Footer (brand section)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
