import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calculator,
  AlertTriangle,
  RefreshCw,
  Target,
  Package
} from "lucide-react";
import PricingAudit from "./PricingAudit";

interface CostAnalysisData {
  totalInventoryValue: number;
  totalCost: number;
  totalRevenue: number;
  grossProfitMargin: number;
  topPerformingProducts: {
    id: number;
    name: string;
    margin: number;
    revenue: number;
    cost: number;
    category: string;
  }[];
  lowMarginProducts: {
    id: number;
    name: string;
    margin: number;
    currentStock: number;
    reorderPoint: number;
  }[];
  categorySummary: {
    category: string;
    totalValue: number;
    totalCost: number;
    margin: number;
    itemCount: number;
  }[];
  reorderAlerts: {
    id: number;
    name: string;
    currentStock: number;
    reorderPoint: number;
    urgency: "critical" | "high" | "medium";
    estimatedDaysLeft: number;
  }[];
}

export default function CostAnalysisDashboard() {
  const [costData, setCostData] = useState<CostAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCostAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cost-analysis?timeframe=${selectedTimeframe}`);
      if (response.ok) {
        const data = await response.json();
        setCostData(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Cost analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCostAnalysis();
  }, [selectedTimeframe]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 50) return "text-green-600";
    if (margin >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  if (!costData) {
    return (
      <Card className="notepad-card">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-yellow-200 rounded w-3/4 mx-auto"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-yellow-100 rounded"></div>
              <div className="h-20 bg-yellow-100 rounded"></div>
            </div>
            <div className="h-4 bg-yellow-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="notepad-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="handwritten-text text-blue-800 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3" />
              Cost Analysis Dashboard
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32 handwritten-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={fetchCostAnalysis}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="handwritten-text"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="notepad-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm handwritten-text text-gray-600">Total Inventory Value</p>
                <p className="text-2xl font-bold handwritten-text text-blue-700">
                  ${costData.totalInventoryValue.toLocaleString()}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="notepad-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm handwritten-text text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold handwritten-text text-red-600">
                  ${costData.totalCost.toLocaleString()}
                </p>
              </div>
              <Calculator className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="notepad-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm handwritten-text text-gray-600">Projected Revenue</p>
                <p className="text-2xl font-bold handwritten-text text-green-600">
                  ${costData.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="notepad-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm handwritten-text text-gray-600">Gross Margin</p>
                <p className={`text-2xl font-bold handwritten-text ${getMarginColor(costData.grossProfitMargin)}`}>
                  {costData.grossProfitMargin.toFixed(1)}%
                </p>
              </div>
              {costData.grossProfitMargin >= 40 ? 
                <TrendingUp className="w-8 h-8 text-green-500" /> : 
                <TrendingDown className="w-8 h-8 text-red-500" />
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reorder Alerts */}
      {costData.reorderAlerts.length > 0 && (
        <Card className="notepad-card">
          <CardHeader>
            <CardTitle className="handwritten-text text-orange-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Reorder Alerts ({costData.reorderAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costData.reorderAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className={getUrgencyColor(alert.urgency)}>
                      {alert.urgency.toUpperCase()}
                    </Badge>
                    <div>
                      <span className="font-medium handwritten-text">{alert.name}</span>
                      <p className="text-sm text-gray-600 handwritten-text">
                        Stock: {alert.currentStock} | Reorder at: {alert.reorderPoint}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium handwritten-text">
                      ~{alert.estimatedDaysLeft} days left
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="notepad-card">
          <CardHeader>
            <CardTitle className="handwritten-text text-green-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costData.topPerformingProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="text-sm font-bold text-green-700">#{index + 1}</span>
                    </div>
                    <div>
                      <span className="font-medium handwritten-text">{product.name}</span>
                      <p className="text-sm text-gray-600 handwritten-text">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 handwritten-text">{product.margin.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600 handwritten-text">${product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Margin Products */}
        <Card className="notepad-card">
          <CardHeader>
            <CardTitle className="handwritten-text text-red-800 flex items-center">
              <TrendingDown className="w-5 h-5 mr-2" />
              Low Margin Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costData.lowMarginProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <span className="font-medium handwritten-text">{product.name}</span>
                    <p className="text-sm text-gray-600 handwritten-text">
                      Stock: {product.currentStock}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 handwritten-text">{product.margin.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600 handwritten-text">Needs Review</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card className="notepad-card">
        <CardHeader>
          <CardTitle className="handwritten-text text-blue-800 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {costData.categorySummary.map((category) => (
              <div key={category.category} className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium handwritten-text">{category.category}</h4>
                  <Badge variant="outline" className="handwritten-text">
                    {category.itemCount} items
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 handwritten-text">Value:</span>
                    <span className="text-sm font-medium handwritten-text">
                      ${category.totalValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 handwritten-text">Margin:</span>
                    <span className={`text-sm font-bold handwritten-text ${getMarginColor(category.margin)}`}>
                      {category.margin.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={category.margin} 
                    className="h-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Data Audit */}
      <div className="grid grid-cols-1 gap-6">
        <PricingAudit />
      </div>

      {lastUpdated && (
        <p className="text-sm text-gray-500 handwritten-text text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}