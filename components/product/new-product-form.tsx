'use client';

import { useState } from 'react';
import { useProductStore } from '@/lib/store/product-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const NewProductForm: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const { createProduct } = useProductStore();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<'food' | 'drink' | ''>('');
  const [color, setColor] = useState('');
  const [emoji, setEmoji] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) {
      toast.error('Name and price are required');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Price must be a positive number');
      return;
    }

    setIsLoading(true);

    try {
      await createProduct({
        name,
        price: priceValue,
        type: type as 'food' | 'drink' | undefined,
        color: color || undefined,
        emoji: emoji || undefined,
      });

      setName('');
      setPrice('');
      setType('');
      setColor('');
      setEmoji('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          type="number"
          step="0.01"
          min="0"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as 'food' | 'drink' | '')}
          className="w-full p-2 border rounded"
        >
          <option value="">Select type (optional)</option>
          <option value="food">Food</option>
          <option value="drink">Drink</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color (optional)</Label>
        <Input
          id="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          type="color"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emoji">Emoji (optional)</Label>
        <Input
          id="emoji"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Product'}
      </Button>
    </form>
  );
};
