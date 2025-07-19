import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wine, GlassWater, Sparkles, Database, AlertCircle, Martini } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Simple types for now
interface Cocktail {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strInstructions: string;
  strCategory?: string;
  strGlass?: string;
}

interface InventoryItem {
  id: number;
  name: string;
  brand: string;
  quantity: number;
  alcoholContent: number | null;
}

export default function DrinkSuggestions() {
  const [selectedIngredient, setSelectedIngredient] = useState('Vodka');
  const { toast } = useToast();

  // Simple mock data for now to test the component
  const mockInventory: InventoryItem[] = [
    { id: 1, name: 'Vodka', brand: 'Premium Vodka', quantity: 5, alcoholContent: 40 },
    { id: 2, name: 'Whiskey', brand: 'Premium Whiskey', quantity: 3, alcoholContent: 45 },
  ];

  const mockCocktails: Cocktail[] = [
    {
      idDrink: '1',
      strDrink: 'Vodka Martini',
      strDrinkThumb: 'https://www.thecocktaildb.com/images/media/drink/qyxrqw1439906528.jpg/preview',
      strInstructions: 'Stir vodka and vermouth with ice, strain into chilled glass, garnish with olive.',
      strCategory: 'Cocktail',
      strGlass: 'Cocktail glass'
    },
    {
      idDrink: '2',
      strDrink: 'Whiskey Sour',
      strDrinkThumb: 'https://www.thecocktaildb.com/images/media/drink/hbkfsh1589574990.jpg/preview',
      strInstructions: 'Shake whiskey, lemon juice, and simple syrup with ice, strain into glass.',
      strCategory: 'Cocktail',
      strGlass: 'Old-fashioned glass'
    }
  ];

  const handleIngredientChange = (ingredient: string) => {
    setSelectedIngredient(ingredient);
    toast({
      title: "Searching Cocktails",
      description: `Finding cocktails with ${ingredient}...`,
    });
  };

  const availableSpirits = mockInventory.filter(item => item.alcoholContent && item.alcoholContent > 0);

  return (
    <div className="space-y-6">
      {/* Inventory Overview */}
      <Card className="notebook-card">
        <CardHeader>
          <CardTitle className="handwritten-title text-2xl flex items-center gap-2">
            <Database className="w-6 h-6" />
            Current Inventory
            <Badge variant="secondary" className="ml-2">
              {mockInventory.length} items
            </Badge>
          </CardTitle>
          <CardDescription>
            Available ingredients for cocktail making
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableSpirits.map(item => (
              <div key={item.id} className="flex flex-col items-center p-3 border rounded-lg bg-muted/30">
                <span className="font-semibold text-sm text-center">{item.name}</span>
                <span className="text-xs text-muted-foreground text-center">{item.brand}</span>
                <Badge variant="secondary" className="mt-1">
                  {item.quantity} units
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cocktail Suggestions */}
      <Tabs defaultValue="vodka" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="vodka" 
            onClick={() => handleIngredientChange('Vodka')}
            className="flex items-center gap-2"
          >
            <Martini className="w-4 h-4" />
            Vodka Drinks
          </TabsTrigger>
          <TabsTrigger 
            value="whiskey" 
            onClick={() => handleIngredientChange('Whiskey')}
            className="flex items-center gap-2"
          >
            <Wine className="w-4 h-4" />
            Whiskey Drinks
          </TabsTrigger>
          <TabsTrigger 
            value="random" 
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Random
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vodka" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCocktails.map(cocktail => (
              <Card key={cocktail.idDrink} className="notebook-card">
                <CardHeader className="pb-3">
                  <CardTitle className="handwritten-title text-lg">{cocktail.strDrink}</CardTitle>
                  <CardDescription className="text-sm">
                    {cocktail.strCategory} • {cocktail.strGlass}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cocktail.strDrinkThumb && (
                    <img 
                      src={cocktail.strDrinkThumb} 
                      alt={cocktail.strDrink}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Instructions:</h4>
                    <p className="text-sm text-muted-foreground">
                      {cocktail.strInstructions}
                    </p>
                  </div>

                  <Button size="sm" className="w-full">
                    <GlassWater className="w-4 h-4 mr-2" />
                    Make This Drink
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="whiskey" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCocktails.map(cocktail => (
              <Card key={cocktail.idDrink} className="notebook-card">
                <CardHeader className="pb-3">
                  <CardTitle className="handwritten-title text-lg">{cocktail.strDrink}</CardTitle>
                  <CardDescription className="text-sm">
                    {cocktail.strCategory} • {cocktail.strGlass}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cocktail.strDrinkThumb && (
                    <img 
                      src={cocktail.strDrinkThumb} 
                      alt={cocktail.strDrink}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Instructions:</h4>
                    <p className="text-sm text-muted-foreground">
                      {cocktail.strInstructions}
                    </p>
                  </div>

                  <Button size="sm" className="w-full">
                    <GlassWater className="w-4 h-4 mr-2" />
                    Make This Drink
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="random" className="space-y-4">
          <Card className="notebook-card">
            <CardHeader>
              <CardTitle className="handwritten-title text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Random Cocktail: Moscow Mule
              </CardTitle>
              <CardDescription>
                Cocktail • Copper mug
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <img 
                  src="https://www.thecocktaildb.com/images/media/drink/3pylqc1504370988.jpg/preview"
                  alt="Moscow Mule"
                  className="w-full h-64 object-cover rounded-lg"
                />
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Ingredients:</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Vodka</span>
                        <span className="text-muted-foreground">2 oz</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">Lime juice</span>
                        <span className="text-muted-foreground">1/2 oz</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">Ginger beer</span>
                        <span className="text-muted-foreground">4 oz</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Instructions:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Combine vodka and lime juice in a copper mug. Fill with ice and top with ginger beer. Garnish with lime wheel and mint sprig.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Get Another Random Cocktail
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}