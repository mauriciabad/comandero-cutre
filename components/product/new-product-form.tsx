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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) {
      toast.error('El nombre y el precio son obligatorios');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('El precio debe ser un número positivo');
      return;
    }

    setIsLoading(true);

    try {
      await createProduct({
        name,
        price: priceValue,
        type: type as 'food' | 'drink' | undefined,
        color: color || undefined,
      });

      setName('');
      setPrice('');
      setType('');
      setColor('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error al crear el producto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ejemplo: Cafe solo con hielo"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Precio</Label>
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
        <Label htmlFor="type">Tipo</Label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as 'food' | 'drink' | '')}
          className="w-full p-2 border rounded"
        >
          <option value="" disabled>
            Cualquiera
          </option>
          <option value="food">Comida</option>
          <option value="drink">Bebida</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color (opcional)</Label>
        <Input
          id="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="#RRGGBB"
          type="color"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creando...' : 'Crear Producto'}
      </Button>
    </form>
  );
};
