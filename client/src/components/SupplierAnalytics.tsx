import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Truck, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign,
  Star,
  Package,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

interface SupplierMetrics {
  id: number;
  name: string;
  category: string;
  performanceScore: number;
  deliveryReliability: number;
  costTrend: "up" | "down" | "stable";
  costChange: number;
  averageDeliveryDays: number;
  totalOrders: number;
  onTimeDeliveries: number;
  qualityScore: number;
  lastDelivery: string;
  activeProducts: number;
}

export default function SupplierAnalytics() {
  const [suppliers, setSuppliers] = useState<SupplierMetrics[]>([]);
  const [timeframe, setTimeframe] = useState("30d");
  const [sortBy, setSortBy] = useState("performance");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSupplierMetrics();
  }, [timeframe]);

  const fetchSupplierMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/supplier-analytics?timeframe=${timeframe}`);
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers || []);
      }
    } catch (error) {
      console.error('Supplier analytics error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSortedSuppliers = () => {
    return [...suppliers].sort((a, b) => {
      switch (sortBy) {
        case "performance":
          return b.performanceScore - a.performanceScore;
        case "reliability":
          return b.deliveryReliability - a.deliveryReliability;
        case "cost":
          return a.costChange - b.costChange;
        default:
          return 0;
      }
    });
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 75) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>;
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-red-600" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-green-600" />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  };

  const getStarRating = (score: number) => {
    const stars = Math.round(score / 20); // Convert 0-100 to 0-5 stars
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= stars ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockSuppliers: SupplierMetrics[] = [
      {
        id: 1,
        name: "Premium Beverage Distributors",
        category: "Beer & Wine",
        performanceScore: 94,
        deliveryReliability: 96,
        costTrend: "stable",
        costChange: 0.5,
        averageDeliveryDays: 2,
        totalOrders: 24,
        onTimeDeliveries: 23,
        qualityScore: 92,
        lastDelivery: "2025-06-29",
        activeProducts: 8
      },
      {
        id: 2,
        name: "Metro Liquor Supply Co.",
        category: "Spirits",
        performanceScore: 87,
        deliveryReliability: 89,
        costTrend: "up",
        costChange: 3.2,
        averageDeliveryDays: 3,
        totalOrders: 18,
        onTimeDeliveries: 16,
        qualityScore: 85,
        lastDelivery: "2025-06-28",
        activeProducts: 5
      },
      {
        id: 3,
        name: "Regional Beer Depot",
        category: "Beer",
        performanceScore: 72,
        deliveryReliability: 78,
        costTrend: "down",
        costChange: -1.8,
        averageDeliveryDays: 4,
        totalOrders: 15,
        onTimeDeliveries: 12,
        qualityScore: 74,
        lastDelivery: "2025-06-26",
        activeProducts: 6
      }
    ];
    setSuppliers(mockSuppliers);
  }, []);

  const avgPerformance = suppliers.length > 0 
    ? suppliers.reduce((sum, s) => sum + s.performanceScore, 0) / suppliers.length 
    : 0;

  const topPerformer = suppliers.reduce((best, current) => 
    current.performanceScore > best.performanceScore ? current : best, 
    suppliers[0] || {} as SupplierMetrics
  );

  return (
    <Card className="notepad-card">
      <CardHeader>
        <CardTitle className="handwritten-text text-orange-800 flex items-center justify-between">
          <div className="flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Supplier Performance Analytics
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-24 handwritten-text">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={fetchSupplierMetrics}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="handwritten-text"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 handwritten-text">{suppliers.length}</div>
            <div className="text-xs text-blue-700 handwritten-text">Active Suppliers</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 handwritten-text">{avgPerformance.toFixed(0)}%</div>
            <div className="text-xs text-green-700 handwritten-text">Avg Performance</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 handwritten-text">
              {suppliers.reduce((sum, s) => sum + s.averageDeliveryDays, 0) / suppliers.length || 0}
            </div>
            <div className="text-xs text-yellow-700 handwritten-text">Avg Delivery Days</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 handwritten-text">{topPerformer?.name?.split(' ')[0] || "N/A"}</div>
            <div className="text-xs text-purple-700 handwritten-text">Top Performer</div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium handwritten-text text-gray-700">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 handwritten-text">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="performance">Performance Score</SelectItem>
              <SelectItem value="reliability">Delivery Reliability</SelectItem>
              <SelectItem value="cost">Cost Changes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Supplier List */}
        <div className="space-y-4">
          {getSortedSuppliers().map((supplier) => (
            <Card key={supplier.id} className="border-l-4 border-l-orange-400">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Supplier Info */}
                  <div className="lg:col-span-1">
                    <h3 className="font-bold handwritten-text text-gray-800">{supplier.name}</h3>
                    <p className="text-sm text-gray-600 handwritten-text">{supplier.category}</p>
                    <div className="flex items-center mt-1">
                      {getStarRating(supplier.qualityScore)}
                      <span className="ml-2 text-xs text-gray-600 handwritten-text">
                        ({supplier.qualityScore}/100)
                      </span>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="lg:col-span-1">
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 handwritten-text">Performance</span>
                          <span className={`text-xs font-bold handwritten-text ${getPerformanceColor(supplier.performanceScore)}`}>
                            {supplier.performanceScore}%
                          </span>
                        </div>
                        <Progress value={supplier.performanceScore} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600 handwritten-text">Reliability</span>
                          <span className="text-xs font-bold handwritten-text text-blue-600">
                            {supplier.deliveryReliability}%
                          </span>
                        </div>
                        <Progress value={supplier.deliveryReliability} className="h-2" />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Stats */}
                  <div className="lg:col-span-1">
                    <div className="space-y-1 text-sm handwritten-text">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{supplier.averageDeliveryDays} day avg</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{supplier.onTimeDeliveries}/{supplier.totalOrders} on time</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Last: {new Date(supplier.lastDelivery).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Cost & Status */}
                  <div className="lg:col-span-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        {getPerformanceBadge(supplier.performanceScore)}
                        <div className="flex items-center">
                          {getTrendIcon(supplier.costTrend, supplier.costChange)}
                          <span className={`text-xs font-bold handwritten-text ml-1 ${
                            supplier.costTrend === 'up' ? 'text-red-600' : 
                            supplier.costTrend === 'down' ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {supplier.costChange > 0 ? '+' : ''}{supplier.costChange}%
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 handwritten-text">
                        {supplier.activeProducts} active products
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Insights */}
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h4 className="font-bold handwritten-text text-orange-800 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Supplier Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm handwritten-text">
            <div>• Premium Beverage Distributors leads with 94% performance score</div>
            <div>• Metro Liquor Supply shows 3.2% cost increase - monitor pricing</div>
            <div>• Regional Beer Depot has 22% late deliveries - consider backup supplier</div>
            <div>• Overall supplier reliability at 87% - above industry standard</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}