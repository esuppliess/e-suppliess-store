import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Star, GripVertical } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  sort_order: number;
  is_active: boolean;
}

interface ProofImage {
  id: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

export default function AdminVouches() {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [proofImages, setProofImages] = useState<ProofImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [testimonialDialogOpen, setTestimonialDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [proofImageUrls, setProofImageUrls] = useState<string[]>([]);

  // Form state
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formText, setFormText] = useState('');
  const [formRating, setFormRating] = useState('5');
  const [formActive, setFormActive] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [testRes, proofRes] = await Promise.all([
      supabase.from('testimonials').select('*').order('sort_order'),
      supabase.from('proof_images').select('*').order('sort_order'),
    ]);
    if (testRes.data) setTestimonials(testRes.data);
    if (proofRes.data) {
      setProofImages(proofRes.data);
      setProofImageUrls(proofRes.data.filter(p => p.is_active).map(p => p.image_url));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setFormName('');
    setFormLocation('');
    setFormText('');
    setFormRating('5');
    setFormActive(true);
    setEditingTestimonial(null);
  };

  const openEditTestimonial = (t: Testimonial) => {
    setEditingTestimonial(t);
    setFormName(t.name);
    setFormLocation(t.location);
    setFormText(t.text);
    setFormRating(String(t.rating));
    setFormActive(t.is_active);
    setTestimonialDialogOpen(true);
  };

  const handleSaveTestimonial = async () => {
    const data = {
      name: formName,
      location: formLocation,
      text: formText,
      rating: parseInt(formRating),
      is_active: formActive,
    };

    if (editingTestimonial) {
      const { error } = await supabase.from('testimonials').update(data).eq('id', editingTestimonial.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Testimonial updated' });
    } else {
      const maxOrder = testimonials.length > 0 ? Math.max(...testimonials.map(t => t.sort_order)) + 1 : 0;
      const { error } = await supabase.from('testimonials').insert({ ...data, sort_order: maxOrder });
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Testimonial added' });
    }

    setTestimonialDialogOpen(false);
    resetForm();
    fetchData();
  };

  const handleDeleteTestimonial = async (id: string) => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Testimonial deleted' });
    fetchData();
  };

  const handleProofImagesChange = async (newUrls: string[]) => {
    setProofImageUrls(newUrls);
    
    // Sync with database: delete all existing, re-insert
    await supabase.from('proof_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (newUrls.length > 0) {
      const inserts = newUrls.map((url, i) => ({
        image_url: url,
        sort_order: i,
        is_active: true,
      }));
      const { error } = await supabase.from('proof_images').insert(inserts);
      if (error) {
        toast({ title: 'Error saving images', description: error.message, variant: 'destructive' });
        return;
      }
    }
    
    toast({ title: 'Proof images saved' });
    fetchData();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Vouches & Proof</h1>
          <p className="text-muted-foreground">Manage proof images and customer testimonials</p>
        </div>

        {/* Proof Images Section */}
        <Card>
          <CardHeader>
            <CardTitle>Proof of Delivery Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader
              images={proofImageUrls}
              onImagesChange={handleProofImagesChange}
              bucket="site-assets"
              maxImages={12}
            />
          </CardContent>
        </Card>

        {/* Testimonials Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Customer Testimonials</CardTitle>
            <Dialog open={testimonialDialogOpen} onOpenChange={(open) => {
              setTestimonialDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Testimonial
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name (can be masked, e.g. M***)</Label>
                    <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="M***" />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="Toronto, ON" />
                  </div>
                  <div>
                    <Label>Testimonial Text</Label>
                    <Textarea value={formText} onChange={e => setFormText(e.target.value)} placeholder="Great experience..." />
                  </div>
                  <div>
                    <Label>Rating</Label>
                    <Select value={formRating} onValueChange={setFormRating}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(r => (
                          <SelectItem key={r} value={String(r)}>{r} Star{r > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={formActive} onCheckedChange={setFormActive} />
                    <Label>Active</Label>
                  </div>
                  <Button onClick={handleSaveTestimonial} className="w-full" disabled={!formName || !formLocation || !formText}>
                    {editingTestimonial ? 'Update' : 'Add'} Testimonial
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {testimonials.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No testimonials yet. Add your first one!</p>
            ) : (
              <div className="space-y-3">
                {testimonials.map((t) => (
                  <div key={t.id} className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{t.name}</span>
                        <span className="text-xs text-muted-foreground">— {t.location}</span>
                        {!t.is_active && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">Hidden</span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 mb-1">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">"{t.text}"</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEditTestimonial(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTestimonial(t.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
