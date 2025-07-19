import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InventorySession, InventoryItem, Product } from "@shared/schema";

interface InventorySessionItem extends InventoryItem {
  product?: Product;
}

interface SessionStats {
  startTime: string;
  itemCount: number;
  totalValue: string;
  avgAccuracy: number;
}

export function useInventorySession() {
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create session on mount
  useEffect(() => {
    createSession();
  }, []);

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/inventory-sessions', {
        startTime: new Date().toISOString(),
        userId: null,
        totalItems: 0,
        totalValue: "0.00",
        syncedToMarginEdge: false
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.id);
      // Store session ID in localStorage for persistence
      localStorage.setItem('currentInventorySession', data.id.toString());
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create inventory session",
        variant: "destructive"
      });
    }
  });

  const createSession = () => {
    // Check for existing session in localStorage
    const existingSessionId = localStorage.getItem('currentInventorySession');
    if (existingSessionId) {
      setCurrentSessionId(parseInt(existingSessionId));
    } else {
      createSessionMutation.mutate();
    }
  };

  // Get current session
  const { data: session } = useQuery<InventorySession>({
    queryKey: [`/api/inventory-sessions/${currentSessionId}`],
    enabled: !!currentSessionId,
  });

  // Get session items
  const { data: sessionItems = [] } = useQuery<InventoryItem[]>({
    queryKey: [`/api/inventory-sessions/${currentSessionId}/items`],
    enabled: !!currentSessionId,
  });

  // Get all products for item display
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Enhance session items with product data
  const enhancedSessionItems: InventorySessionItem[] = sessionItems.map((item: InventoryItem) => ({
    ...item,
    product: products.find((p: Product) => p.id === item.productId)
  }));

  // Add inventory item
  const addItemMutation = useMutation({
    mutationFn: async ({ product, quantity, confidence }: { product: Product, quantity: number, confidence: number }) => {
      const totalValue = (Number(product.unitPrice) * quantity).toFixed(2);
      
      const response = await apiRequest('POST', '/api/inventory-items', {
        sessionId: currentSessionId,
        productId: product.id,
        quantity,
        unitPrice: product.unitPrice,
        totalValue,
        recordedAt: new Date().toISOString(),
        recognitionConfidence: confidence.toString()
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch session items
      queryClient.invalidateQueries({ queryKey: [`/api/inventory-sessions/${currentSessionId}/items`] });
      queryClient.invalidateQueries({ queryKey: [`/api/inventory-sessions/${currentSessionId}`] });
      
      toast({
        title: "Item Added",
        description: "Successfully recorded inventory item",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive"
      });
    }
  });

  // Sync to MarginEdge
  const syncMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest('POST', '/api/sync-margin-edge', {
        sessionId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/inventory-sessions/${currentSessionId}`] });
      
      toast({
        title: "Sync Successful!",
        description: `${enhancedSessionItems.length} items have been successfully transmitted to MarginEdge.`,
      });
      
      // Clear session and create new one
      localStorage.removeItem('currentInventorySession');
      setTimeout(() => {
        createSession();
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync with MarginEdge",
        variant: "destructive"
      });
    }
  });

  // Calculate session statistics
  const sessionStats: SessionStats = {
    startTime: session?.startTime 
      ? new Date(session.startTime).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })
      : "",
    itemCount: enhancedSessionItems.length,
    totalValue: enhancedSessionItems.reduce((sum, item) => sum + parseFloat(item.totalValue), 0).toFixed(0),
    avgAccuracy: enhancedSessionItems.length > 0 
      ? Math.round(enhancedSessionItems.reduce((sum, item) => sum + (parseFloat(item.recognitionConfidence || "0")), 0) / enhancedSessionItems.length)
      : 0
  };

  return {
    session,
    sessionItems: enhancedSessionItems,
    sessionStats,
    addItem: (product: Product, quantity: number, confidence: number) => 
      addItemMutation.mutate({ product, quantity, confidence }),
    syncToMarginEdge: (sessionId: number) => syncMutation.mutate(sessionId),
    isLoading: addItemMutation.isPending || syncMutation.isPending || createSessionMutation.isPending
  };
}
