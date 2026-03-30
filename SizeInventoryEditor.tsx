import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface SizeInventory {
  size: string;
  quantity: number;
}

interface SizeInventoryEditorProps {
  sizes: SizeInventory[];
  onChange: (sizes: SizeInventory[]) => void;
}

export function SizeInventoryEditor({ sizes, onChange }: SizeInventoryEditorProps) {
  const [newSize, setNewSize] = useState('');
  const [newQuantity, setNewQuantity] = useState('1');

  const handleAdd = () => {
    const trimmedSize = newSize.trim();
    if (!trimmedSize) return;
    
    // Check for duplicates
    if (sizes.some(s => s.size.toLowerCase() === trimmedSize.toLowerCase())) {
      return;
    }

    onChange([...sizes, { size: trimmedSize, quantity: parseInt(newQuantity) || 1 }]);
    setNewSize('');
    setNewQuantity('1');
  };

  const handleRemove = (index: number) => {
    onChange(sizes.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...sizes];
    updated[index] = { ...updated[index], quantity: Math.max(0, quantity) };
    onChange(updated);
  };

  const handleSizeChange = (index: number, size: string) => {
    const updated = [...sizes];
    updated[index] = { ...updated[index], size };
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const totalInventory = sizes.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Size & Inventory</Label>
        <span className="text-xs text-muted-foreground">
          Total: {totalInventory} items
        </span>
      </div>

      {/* Existing sizes */}
      {sizes.length > 0 && (
        <div className="space-y-2">
          {sizes.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={item.size}
                onChange={(e) => handleSizeChange(index, e.target.value)}
                placeholder="Size"
                className="w-24"
              />
              <Input
                type="number"
                min="0"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                placeholder="Qty"
                className="w-20"
              />
              <span className="text-xs text-muted-foreground">in stock</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new size */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Input
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Size (e.g., M, 9.5)"
          className="w-24"
        />
        <Input
          type="number"
          min="1"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Qty"
          className="w-20"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!newSize.trim()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Add each size with its available quantity. Leave empty for products without sizes.
      </p>
    </div>
  );
}
