import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface FAQ {
  id: string;
  section: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

const DEFAULT_SECTIONS = ['Orders', 'Delivery', 'Payments', 'Authenticity & Condition', 'Support'];

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [form, setForm] = useState({ section: 'Orders', question: '', answer: '' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchFaqs = async () => {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('section')
      .order('sort_order');
    if (!error && data) setFaqs(data as FAQ[]);
    setLoading(false);
  };

  useEffect(() => { fetchFaqs(); }, []);

  const sections = [...new Set([...DEFAULT_SECTIONS, ...faqs.map(f => f.section)])];

  const openNew = () => {
    setEditingFaq(null);
    setForm({ section: 'Orders', question: '', answer: '' });
    setDialogOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setForm({ section: faq.section, question: faq.question, answer: faq.answer });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);

    if (editingFaq) {
      const { error } = await supabase
        .from('faqs')
        .update({ section: form.section, question: form.question, answer: form.answer })
        .eq('id', editingFaq.id);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'FAQ updated' });
    } else {
      const maxOrder = faqs.filter(f => f.section === form.section).length;
      const { error } = await supabase
        .from('faqs')
        .insert({ section: form.section, question: form.question, answer: form.answer, sort_order: maxOrder });
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'FAQ added' });
    }

    setSaving(false);
    setDialogOpen(false);
    fetchFaqs();
  };

  const toggleActive = async (faq: FAQ) => {
    await supabase.from('faqs').update({ is_active: !faq.is_active }).eq('id', faq.id);
    fetchFaqs();
  };

  const deleteFaq = async (id: string) => {
    await supabase.from('faqs').delete().eq('id', id);
    fetchFaqs();
    toast({ title: 'FAQ deleted' });
  };

  if (loading) return <AdminLayout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">FAQs</h1>
            <p className="text-muted-foreground text-sm">Manage frequently asked questions</p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> Add FAQ
          </Button>
        </div>

        {sections.map(section => {
          const sectionFaqs = faqs.filter(f => f.section === section);
          if (sectionFaqs.length === 0) return null;
          return (
            <div key={section} className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{section}</h2>
              <div className="space-y-2">
                {sectionFaqs.map(faq => (
                  <div key={faq.id} className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${!faq.is_active ? 'text-muted-foreground line-through' : ''}`}>
                        {faq.question}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={faq.is_active} onCheckedChange={() => toggleActive(faq)} />
                      <Button variant="ghost" size="icon" onClick={() => openEdit(faq)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteFaq(faq.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {faqs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No FAQs yet. Click "Add FAQ" to create one.</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Section</Label>
              <Input
                value={form.section}
                onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                list="faq-sections"
              />
              <datalist id="faq-sections">
                {DEFAULT_SECTIONS.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div>
              <Label>Question</Label>
              <Input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} />
            </div>
            <div>
              <Label>Answer</Label>
              <Textarea rows={4} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : editingFaq ? 'Update' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
