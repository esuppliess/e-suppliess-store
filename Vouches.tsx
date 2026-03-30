import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
}

interface ProofImage {
  id: string;
  image_url: string;
}

export default function Vouches() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [proofImages, setProofImages] = useState<ProofImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [testRes, proofRes] = await Promise.all([
        supabase.from('testimonials').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('proof_images').select('*').eq('is_active', true).order('sort_order'),
      ]);
      if (testRes.data) setTestimonials(testRes.data);
      if (proofRes.data) setProofImages(proofRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-heading">Customer Reviews</span>
          <h1 className="text-3xl md:text-5xl font-bold mt-2 mb-4">Vouches & Proof</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Don't just take our word for it. See what our customers have to say about their experience.
          </p>
        </div>

        {/* Proof Grid */}
        {proofImages.length > 0 && (
          <section className="mb-16">
            <h2 className="section-heading mb-6">Proof of Delivery</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {proofImages.map((image) => (
                <div key={image.id} className="aspect-square bg-card rounded-xl overflow-hidden">
                  <img
                    src={image.image_url}
                    alt="Proof of delivery"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              * For privacy, some details may be blurred or cropped
            </p>
          </section>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="mb-16">
            <h2 className="section-heading mb-6">Customer Feedback</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-gold">★</span>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{testimonial.name}</span>
                    <span className="text-muted-foreground">{testimonial.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loading && testimonials.length === 0 && proofImages.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No vouches yet. Check back soon!</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" className="rounded-xl" asChild>
            <Link to="/shop">
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
