import { useState, useRef } from 'react';
import { Save, Upload, Loader2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useSiteContent, useUpdateSiteContent } from '@/hooks/useSiteContent';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AdminContent() {
  const { data: content, isLoading } = useSiteContent();
  const { data: categories } = useCategories();
  const updateContent = useUpdateSiteContent();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadField, setCurrentUploadField] = useState<string | null>(null);

  // Initialize form data when content loads
  const getFieldValue = (field: string) => {
    if (formData[field] !== undefined) return formData[field];
    if (content) return (content as any)[field];
    return '';
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!content?.id) return;

    try {
      await updateContent.mutateAsync({
        id: content.id,
        ...formData,
      });
      setFormData({});
      toast({
        title: 'Content saved',
        description: 'Your changes are now live on the site.',
      });
    } catch (error: any) {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, isArray = false, arrayIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file || !content) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file.', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Image must be under 5MB.', variant: 'destructive' });
      return;
    }

    setUploadingField(field + (arrayIndex !== undefined ? `-${arrayIndex}` : ''));

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `content-${field}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      if (isArray && arrayIndex !== undefined) {
        const currentArray = getFieldValue(field) || [];
        const newArray = [...currentArray];
        newArray[arrayIndex] = publicUrl;
        handleFieldChange(field, newArray);
      } else {
        handleFieldChange(field, publicUrl);
      }

      toast({ title: 'Image uploaded', description: 'Image has been uploaded successfully.' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingField(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddArrayImage = (field: string) => {
    const currentArray = getFieldValue(field) || [];
    handleFieldChange(field, [...currentArray, '']);
  };

  const handleRemoveArrayImage = (field: string, index: number) => {
    const currentArray = getFieldValue(field) || [];
    const newArray = currentArray.filter((_: any, i: number) => i !== index);
    handleFieldChange(field, newArray);
    // Keep lifestyle_image_links in sync
    if (field === 'lifestyle_images') {
      const links = getFieldValue('lifestyle_image_links') || [];
      const newLinks = links.filter((_: any, i: number) => i !== index);
      handleFieldChange('lifestyle_image_links', newLinks);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  const hasChanges = Object.keys(formData).length > 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Site Content</h1>
            <p className="text-muted-foreground">Edit text, images, and links on the main page</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || updateContent.isPending}
          >
            {updateContent.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="vendors">Vendors CTA</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>The main banner at the top of the homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="hero_title">Title</Label>
                    <Input
                      id="hero_title"
                      value={getFieldValue('hero_title')}
                      onChange={(e) => handleFieldChange('hero_title', e.target.value)}
                      placeholder="Curated Stock. Premium Sourcing."
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero_subtitle">Subtitle</Label>
                    <Input
                      id="hero_subtitle"
                      value={getFieldValue('hero_subtitle')}
                      onChange={(e) => handleFieldChange('hero_subtitle', e.target.value)}
                      placeholder="Built for serious buyers."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hero_button_text">Primary Button Text</Label>
                      <Input
                        id="hero_button_text"
                        value={getFieldValue('hero_button_text')}
                        onChange={(e) => handleFieldChange('hero_button_text', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero_button_link">Primary Button Link</Label>
                      <Input
                        id="hero_button_link"
                        value={getFieldValue('hero_button_link')}
                        onChange={(e) => handleFieldChange('hero_button_link', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hero_secondary_button_text">Secondary Button Text</Label>
                      <Input
                        id="hero_secondary_button_text"
                        value={getFieldValue('hero_secondary_button_text')}
                        onChange={(e) => handleFieldChange('hero_secondary_button_text', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero_secondary_button_link">Secondary Button Link</Label>
                      <Input
                        id="hero_secondary_button_link"
                        value={getFieldValue('hero_secondary_button_link')}
                        onChange={(e) => handleFieldChange('hero_secondary_button_link', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Images */}
                <div>
                  <Label className="mb-3 block">Hero Images (3 panels)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {(getFieldValue('hero_images') || []).map((img: string, idx: number) => (
                      <div key={idx} className="relative group">
                        <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden border">
                          {img ? (
                            <img src={img} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              No image
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id={`hero-image-${idx}`}
                          onChange={(e) => handleImageUpload(e, 'hero_images', true, idx)}
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute bottom-2 left-2 right-2"
                          onClick={() => document.getElementById(`hero-image-${idx}`)?.click()}
                          disabled={uploadingField === `hero_images-${idx}`}
                        >
                          {uploadingField === `hero_images-${idx}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-1" />
                              Replace
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lifestyle Images */}
            <Card>
              <CardHeader>
                <CardTitle>Shop the Look Images</CardTitle>
                <CardDescription>Carousel images in the "Shop the Look" section</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {(getFieldValue('lifestyle_images') || []).map((img: string, idx: number) => {
                    const links = getFieldValue('lifestyle_image_links') || [];
                    const currentLink = links[idx] || '';
                    return (
                    <div key={idx} className="relative group space-y-2">
                      <div className="aspect-[3/2] bg-muted rounded-lg overflow-hidden border">
                        {img ? (
                          <img src={img} alt={`Lifestyle ${idx + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                            No image
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id={`lifestyle-image-${idx}`}
                        onChange={(e) => handleImageUpload(e, 'lifestyle_images', true, idx)}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-6 w-6"
                          onClick={() => handleRemoveArrayImage('lifestyle_images', idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        onClick={() => document.getElementById(`lifestyle-image-${idx}`)?.click()}
                        disabled={uploadingField === `lifestyle_images-${idx}`}
                      >
                        {uploadingField === `lifestyle_images-${idx}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Replace'
                        )}
                      </Button>
                      <select
                        value={currentLink}
                        onChange={(e) => {
                          const newLinks = [...(getFieldValue('lifestyle_image_links') || [])];
                          // Pad array if needed
                          while (newLinks.length <= idx) newLinks.push('');
                          newLinks[idx] = e.target.value;
                          handleFieldChange('lifestyle_image_links', newLinks);
                        }}
                        className="w-full text-xs border rounded px-2 py-1.5 bg-background"
                      >
                        <option value="">No link</option>
                        {categories?.map((cat) => (
                          <option key={cat.id} value={cat.slug}>{cat.display_name}</option>
                        ))}
                      </select>
                    </div>
                    );
                  })}
                  <button
                    onClick={() => handleAddArrayImage('lifestyle_images')}
                    className="aspect-[3/2] border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="h-6 w-6" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Featured Collection */}
          <TabsContent value="featured" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Featured Collection</CardTitle>
                <CardDescription>The highlighted product section on the homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="featured_label">Section Label</Label>
                      <Input
                        id="featured_label"
                        value={getFieldValue('featured_label')}
                        onChange={(e) => handleFieldChange('featured_label', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="featured_title">Title</Label>
                      <Input
                        id="featured_title"
                        value={getFieldValue('featured_title')}
                        onChange={(e) => handleFieldChange('featured_title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="featured_description">Description</Label>
                      <Textarea
                        id="featured_description"
                        value={getFieldValue('featured_description')}
                        onChange={(e) => handleFieldChange('featured_description', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="featured_button_text">Button Text</Label>
                        <Input
                          id="featured_button_text"
                          value={getFieldValue('featured_button_text')}
                          onChange={(e) => handleFieldChange('featured_button_text', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="featured_button_link">Button Link</Label>
                        <Input
                          id="featured_button_link"
                          value={getFieldValue('featured_button_link')}
                          onChange={(e) => handleFieldChange('featured_button_link', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-3 block">Featured Image</Label>
                    <div className="relative">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                        {getFieldValue('featured_image') ? (
                          <img
                            src={getFieldValue('featured_image')}
                            alt="Featured"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="featured-image"
                        onChange={(e) => handleImageUpload(e, 'featured_image')}
                      />
                      <Button
                        className="absolute bottom-4 left-4 right-4"
                        onClick={() => document.getElementById('featured-image')?.click()}
                        disabled={uploadingField === 'featured_image'}
                      >
                        {uploadingField === 'featured_image' ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Replace Image
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendors CTA */}
          <TabsContent value="vendors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendors CTA Section</CardTitle>
                <CardDescription>The call-to-action section promoting vendor lists</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vendors_label">Section Label</Label>
                      <Input
                        id="vendors_label"
                        value={getFieldValue('vendors_label')}
                        onChange={(e) => handleFieldChange('vendors_label', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vendors_title">Title</Label>
                      <Input
                        id="vendors_title"
                        value={getFieldValue('vendors_title')}
                        onChange={(e) => handleFieldChange('vendors_title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vendors_description">Description</Label>
                      <Textarea
                        id="vendors_description"
                        value={getFieldValue('vendors_description')}
                        onChange={(e) => handleFieldChange('vendors_description', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vendors_button_text">Button Text</Label>
                      <Input
                        id="vendors_button_text"
                        value={getFieldValue('vendors_button_text')}
                        onChange={(e) => handleFieldChange('vendors_button_text', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-3 block">Background Image</Label>
                    <div className="relative">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
                        {getFieldValue('vendors_image') ? (
                          <img
                            src={getFieldValue('vendors_image')}
                            alt="Vendors"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="vendors-image"
                        onChange={(e) => handleImageUpload(e, 'vendors_image')}
                      />
                      <Button
                        className="absolute bottom-4 left-4 right-4"
                        onClick={() => document.getElementById('vendors-image')?.click()}
                        disabled={uploadingField === 'vendors_image'}
                      >
                        {uploadingField === 'vendors_image' ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Replace Image
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Links displayed in the site footer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <Input
                    id="instagram_url"
                    value={getFieldValue('instagram_url') || ''}
                    onChange={(e) => handleFieldChange('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="tiktok_url">TikTok URL (Primary)</Label>
                  <Input
                    id="tiktok_url"
                    value={getFieldValue('tiktok_url') || ''}
                    onChange={(e) => handleFieldChange('tiktok_url', e.target.value)}
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
                <div>
                  <Label htmlFor="tiktok_url_2">TikTok URL (Secondary)</Label>
                  <Input
                    id="tiktok_url_2"
                    value={getFieldValue('tiktok_url_2') || ''}
                    onChange={(e) => handleFieldChange('tiktok_url_2', e.target.value)}
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
                <div>
                  <Label htmlFor="discord_url">Discord URL</Label>
                  <Input
                    id="discord_url"
                    value={getFieldValue('discord_url') || ''}
                    onChange={(e) => handleFieldChange('discord_url', e.target.value)}
                    placeholder="https://discord.gg/..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
