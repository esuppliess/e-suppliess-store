import { Info } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const EXPECTATIONS = [
  'Orders are processed before fulfillment',
  'Delivery method is selected at checkout',
  'Tracking details are provided when available',
  'Packaging and condition may vary by item',
];

export function WhatToExpect() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-foreground">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-foreground" strokeWidth={1.5} />
          <span className="text-sm font-medium uppercase tracking-wider">What to Expect</span>
        </div>
        <span className={cn(
          "text-xs text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )}>
          {isOpen ? '−' : '+'}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-foreground">
        <ul className="p-4 space-y-2">
          {EXPECTATIONS.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-foreground mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
