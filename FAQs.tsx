import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';

interface FAQ {
  id: string;
  section: string;
  question: string;
  answer: string;
  sort_order: number;
}

export default function FAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('section')
        .order('sort_order');
      if (data) setFaqs(data as FAQ[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const sections = [...new Set(faqs.map(f => f.section))];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-12">
          <span className="section-heading">Support</span>
          <h1 className="text-3xl md:text-5xl font-bold mt-2 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground">
            Find answers to common questions about orders, shipping, and more.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
          </div>
        ) : sections.length > 0 ? (
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section}>
                <h2 className="section-heading mb-4">{section}</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {faqs
                    .filter(f => f.section === section)
                    .map((item) => (
                      <AccordionItem
                        key={item.id}
                        value={item.id}
                        className="bg-card border border-border rounded-xl px-4"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-4">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">No FAQs available yet.</p>
        )}

        <div className="text-center mt-12 pt-12 border-t border-border">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <Button className="rounded-xl" asChild>
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
