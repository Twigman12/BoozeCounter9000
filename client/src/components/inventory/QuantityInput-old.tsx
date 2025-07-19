/**
 * L.O.G. Framework - Granular Component: Quantity Input
 * Single Responsibility: Handle quantity input and validation
 */

import { useState, useEffect } from "react";


import { Input } from "@/components/ui/input";
import { Hash, Save } from "lucide-react";
import { Product } from "@shared/schema";
import { useLogger } from "@/hooks/useLogger";

interface QuantityInputProps {
  selectedProduct: Product | null;
  onQuantitySubmitted: (product: Product, quantity: number) => void;
  disabled?: boolean;
}

export default function QuantityInput({ 
  selectedProduct, 
  onQuantitySubmitted, 
  disabled = false 
}: QuantityInputProps) {
  const [manualQuantity, setManualQuantity] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const { logUserAction, logError, trackOperation } = useLogger('QuantityInput');

  // Clear quantity when product changes
  useEffect(() => {
    if (selectedProduct) {
      setManualQuantity("");
      setValidationError("");
      logUserAction('quantity_input_reset', { 
        productId: selectedProduct.id,
        productSku: selectedProduct.sku 
      });
    }
  }, [selectedProduct, logUserAction]);

  const validateQuantity = (quantityString: string): { isValid: boolean; quantity?: number; error?: string } => {
    const tracker = trackOperation('validate_quantity', { input: quantityString });
    
    try {
      if (!quantityString.trim()) {
        tracker.end({ valid: false, reason: 'empty_input' });
        return { isValid: false, error: "Quantity is required" };
      }

      const quantity = parseFloat(quantityString.trim());
      
      if (isNaN(quantity)) {
        tracker.end({ valid: false, reason: 'not_a_number' });
        return { isValid: false, error: "Please enter a valid number" };
      }

      if (quantity <= 0) {
        tracker.end({ valid: false, reason: 'negative_or_zero' });
        return { isValid: false, error: "Quantity must be greater than 0" };
      }

      if (quantity > 10000) {
        tracker.end({ valid: false, reason: 'too_large' });
        return { isValid: false, error: "Quantity seems unusually large. Please verify." };
      }

      tracker.end({ valid: true, quantity });
      return { isValid: true, quantity };
    } catch (error: any) {
      logError(error, 'validate_quantity', { input: quantityString });
      tracker.end({ valid: false, error: error.message });
      return { isValid: false, error: "Invalid quantity format" };
    }
  };

  const handleQuantityChange = (value: string) => {
    setManualQuantity(value);
    setValidationError("");
    
    // Real-time validation feedback
    if (value.trim()) {
      const validation = validateQuantity(value);
      if (!validation.isValid && validation.error) {
        setValidationError(validation.error);
      }
    }
  };

  const handleManualQuantitySubmit = () => {
    if (!selectedProduct) {
      setValidationError("Please select a product first");
      return;
    }

    const validation = validateQuantity(manualQuantity);
    
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid quantity");
      logUserAction('quantity_validation_failed', {
        productId: selectedProduct.id,
        input: manualQuantity,
        error: validation.error
      });
      return;
    }

    const tracker = trackOperation('submit_quantity', {
      productId: selectedProduct.id,
      quantity: validation.quantity
    });

    try {
      onQuantitySubmitted(selectedProduct, validation.quantity!);
      
      logUserAction('quantity_submitted', {
        productId: selectedProduct.id,
        productSku: selectedProduct.sku,
        quantity: validation.quantity,
        inputMethod: 'manual'
      });

      // Clear form after successful submission
      setManualQuantity("");
      setValidationError("");
      
      tracker.end({ success: true });
    } catch (error: any) {
      logError(error, 'submit_quantity', {
        productId: selectedProduct.id,
        quantity: validation.quantity
      });
      tracker.end({ success: false, error: error.message });
      setValidationError("Failed to submit quantity. Please try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualQuantitySubmit();
    }
  };

  const isSubmitDisabled = disabled || !selectedProduct || !manualQuantity.trim() || !!validationError;

  return (
    <Card className="notepad-card">
      <CardHeader className="notepad-card-header">
        <CardTitle className="handwritten-title flex items-center">
          <Hash className="mr-2" />
          Enter Quantity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="number"
            placeholder="Enter quantity..."
            value={manualQuantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || !selectedProduct}
            className={validationError ? "border-red-500 focus:border-red-500" : ""}
            min="0"
            step="0.1"
          />
          
          {validationError && (
            <p className="text-sm text-red-500 font-medium">
              {validationError}
            </p>
          )}
          
          {selectedProduct && (
            <p className="text-sm text-muted-foreground">
              Unit: {selectedProduct.unitOfMeasure || 'each'} • 
              Par Level: {selectedProduct.parLevel || 'Not set'}
            </p>
          )}
        </div>

        <Button 
          onClick={handleManualQuantitySubmit}
          disabled={isSubmitDisabled}
          className="w-full notepad-button"
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          Add to Inventory
        </Button>
      </CardContent>
    </Card>
  );
}