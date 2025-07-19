/**
 * L.O.G. Framework - Granular Component: Quantity Input
 * Single Responsibility: Handle quantity input and validation
 */

import React, { useState, useCallback } from 'react';
import { Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLogger } from '@/hooks/useLogger';
import { Package, Plus, Minus, Check } from 'lucide-react';

interface QuantityInputProps {
  product: Product;
  onQuantitySubmitted: (product: Product, quantity: number) => void;
  initialQuantity?: number | null;
}

function QuantityInput({
  product,
  onQuantitySubmitted,
  initialQuantity = null,
}: QuantityInputProps) {
  const { logUserAction, logError, trackOperation } = useLogger('QuantityInput');
  const { toast } = useToast();
  const [quantity, setQuantity] = useState<number>(initialQuantity || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuantityChange = useCallback((value: string) => {
    const numValue = parseInt(value) || 0;
    setQuantity(Math.max(0, numValue));
  }, []);

  const handleIncrement = useCallback(() => {
    setQuantity(prev => prev + 1);
  }, []);

  const handleDecrement = useCallback(() => {
    setQuantity(prev => Math.max(0, prev - 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a quantity greater than 0.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      trackOperation('submit_quantity', { productId: product.id, quantity });
      logUserAction('quantity_submitted', { product: product.name, quantity });
      
      onQuantitySubmitted(product, quantity);
      
      toast({
        title: "Quantity Submitted",
        description: `${quantity} units of ${product.name} added successfully.`,
      });
      
      setQuantity(0);
    } catch (error) {
      logError('quantity_submission_failed', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit quantity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [quantity, product, onQuantitySubmitted, toast, trackOperation, logUserAction, logError]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <Card className="notebook-card">
      <CardHeader>
        <CardTitle className="handwritten-title text-2xl flex items-center gap-2">
          <Package className="w-6 h-6" />
          {product.name}
        </CardTitle>
        <CardDescription>
          {product.brand && `${product.brand} • `}
          {product.size && `${product.size} • `}
          ${Number(product.unitPrice).toFixed(2)} per unit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quantity Input */}
        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-base font-medium">
            Quantity
          </Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={quantity <= 0}
              className="h-10 w-10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-center text-lg font-semibold h-10"
              placeholder="0"
            />
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              className="h-10 w-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Quantity Buttons */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Quick Add</Label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 5, 10].map((quickQty) => (
              <Button
                key={quickQty}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quickQty)}
                className="h-8"
              >
                +{quickQty}
              </Button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={quantity <= 0 || isSubmitting}
          className="w-full h-12 text-lg"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Submitting...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              Submit {quantity} Units
            </div>
          )}
        </Button>

        {/* Total Value Display */}
        {quantity > 0 && (
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold text-green-600">
              ${(quantity * Number(product.unitPrice)).toFixed(2)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default React.memo(QuantityInput);