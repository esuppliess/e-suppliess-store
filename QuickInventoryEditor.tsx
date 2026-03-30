import { useState } from 'react';
import { Package, Minus, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SizeInventory } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

interface QuickInventoryEditorProps {
  sizes: SizeInventory[];
  onSave: (sizes: SizeInventory[]) => void;
  isLoading?: boolean;
}

export function QuickInventoryEditor({ sizes, onSave, isLoading }: QuickInventoryEditorProps) {
  const [localSizes, setLocalSizes] = useState<SizeInventory[]>(sizes);
  const [open, setOpen] = useState(false);

  const totalStock = localSizes.reduce((sum, s) => sum + s.quantity, 0);
  const hasChanges = JSON.stringify(sizes) !== JSON.stringify(localSizes);

  const handleQuantityChange = (index: number, delta: number) => {
    const updated = [...localSizes];
    updated[index] = { 
      ...updated[index], 
      quantity: Math.max(0, updated[index].quantity + delta) 
    };
    setLocalSizes(updated);
  };

  const handleInputChange = (index: number, value: string) => {
    const updated = [...localSizes];
    updated[index] = { 
      ...updated[index], 
      quantity: Math.max(0, parseInt(value) || 0) 
    };
    setLocalSizes(updated);
  };

  const handleSave = () => {
    onSave(localSizes);
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setLocalSizes(sizes);
    }
  };

  const getLowStockCount = () => {
    return localSizes.filter(s => s.quantity > 0 && s.quantity <= 3).length;
  };

  const lowStockCount = getLowStockCount();

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-xs",
            totalStock === 0 && "text-destructive",
            lowStockCount > 0 && totalStock > 0 && "text-yellow-600"
          )}
        >
          <Package className="h-3.5 w-3.5" />
          {totalStock}
          {lowStockCount > 0 && totalStock > 0 && (
            <span className="ml-1 text-[10px] bg-yellow-100 text-yellow-700 px-1 rounded">
              {lowStockCount} low
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Quick Stock Edit</span>
            <span className="text-xs text-muted-foreground">
              Total: {localSizes.reduce((sum, s) => sum + s.quantity, 0)}
            </span>
          </div>
          
          {localSizes.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              No sizes configured. Edit product to add sizes.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {localSizes.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium w-12 truncate",
                    item.quantity === 0 && "text-destructive",
                    item.quantity > 0 && item.quantity <= 3 && "text-yellow-600"
                  )}>
                    {item.size}
                  </span>
                  <div className="flex items-center gap-1 flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleQuantityChange(index, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      className="h-6 w-12 text-center text-xs px-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleQuantityChange(index, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {localSizes.length > 0 && (
            <Button
              size="sm"
              className="w-full gap-2"
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
            >
              <Save className="h-3.5 w-3.5" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
