import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, DollarSign, CheckCircle, XCircle } from "lucide-react";

interface PricingIssue {
  id: number;
  name: string;
  sku: string;
  unitPrice: number;
  costPrice: number;
  issueType: "cost_exceeds_price" | "low_margin" | "missing_cost";
  marginLoss: number;
}

export default function PricingAudit() {
  const [pricingIssues, setPricingIssues] = useState<PricingIssue[]>([]);
  const [healthyProducts, setHealthyProducts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPricingAudit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const products = await response.json();
        
        const issues: PricingIssue[] = [];
        let healthy = 0;
        
        products.forEach((product: any) => {
          const unitPrice = parseFloat(product.unitPrice);
          const costPrice = product.costPrice ? parseFloat(product.costPrice) : null;
          
          if (!costPrice) {
            issues.push({
              id: product.id,
              name: product.name,
              sku: product.sku,
              unitPrice,
              costPrice: 0,
              issueType: "missing_cost",
              marginLoss: 0
            });
          } else if (costPrice >= unitPrice) {
            issues.push({
              id: product.id,
              name: product.name,
              sku: product.sku,
              unitPrice,
              costPrice,
              issueType: "cost_exceeds_price",
              marginLoss: ((costPrice - unitPrice) / unitPrice) * 100
            });
          } else {
            const margin = ((unitPrice - costPrice) / unitPrice) * 100;
            if (margin < 15) {
              issues.push({
                id: product.id,
                name: product.name,
                sku: product.sku,
                unitPrice,
                costPrice,
                issueType: "low_margin",
                marginLoss: margin
              });
            } else {
              healthy++;
            }
          }
        });
        
        setPricingIssues(issues);
        setHealthyProducts(healthy);
      }
    } catch (error) {
      console.error('Pricing audit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingAudit();
  }, []);

  const getIssueColor = (issueType: string) => {
    switch (issueType) {
      case "cost_exceeds_price": return "bg-red-100 text-red-800";
      case "low_margin": return "bg-yellow-100 text-yellow-800";
      case "missing_cost": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getIssueIcon = (issueType: string) => {
    switch (issueType) {
      case "cost_exceeds_price": return <XCircle className="w-4 h-4 text-red-600" />;
      case "low_margin": return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "missing_cost": return <AlertTriangle className="w-4 h-4 text-gray-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getIssueDescription = (issue: PricingIssue) => {
    switch (issue.issueType) {
      case "cost_exceeds_price":
        return `Cost $${issue.costPrice} exceeds selling price $${issue.unitPrice} (${Math.abs(issue.marginLoss).toFixed(0)}% loss)`;
      case "low_margin":
        return `Low margin: ${issue.marginLoss.toFixed(1)}% (recommended minimum: 15%)`;
      case "missing_cost":
        return "Missing cost price data";
      default:
        return "Unknown pricing issue";
    }
  };

  const criticalIssues = pricingIssues.filter(issue => issue.issueType === "cost_exceeds_price");
  const warningIssues = pricingIssues.filter(issue => issue.issueType === "low_margin");
  const missingData = pricingIssues.filter(issue => issue.issueType === "missing_cost");

  return (
    <Card className="notepad-card">
      <CardHeader>
        <CardTitle className="handwritten-text text-red-800 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Pricing Data Audit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pricing Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-bold handwritten-text text-blue-800 mb-2">Understanding Case vs Individual Unit Pricing:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm handwritten-text">
              <div>
                <span className="font-semibold text-green-700">Cost Price:</span> What you pay suppliers
                <p className="text-gray-600">Your wholesale cost per case/unit</p>
              </div>
              <div>
                <span className="font-semibold text-blue-700">Sell Price:</span> What customers pay you
                <p className="text-gray-600">Your retail price per case/unit</p>
              </div>
              <div>
                <span className="font-semibold text-purple-700">Units per Case:</span> Items in package
                <p className="text-gray-600">24-pack = 24 cans, 6-pack = 6 cans</p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800 handwritten-text">
                <strong>Example:</strong> Budweiser 24-pack costs $32.50, sells for $45.99 = 29.3% margin<br/>
                <strong>Per can:</strong> $1.35 cost, $1.92 selling price (realistic beverage pricing)
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600 handwritten-text">{criticalIssues.length}</div>
              <div className="text-xs text-red-700 handwritten-text">Critical Issues</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 handwritten-text">{warningIssues.length}</div>
              <div className="text-xs text-yellow-700 handwritten-text">Low Margins</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600 handwritten-text">{missingData.length}</div>
              <div className="text-xs text-gray-700 handwritten-text">Missing Data</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 handwritten-text">{healthyProducts}</div>
              <div className="text-xs text-green-700 handwritten-text">Healthy Pricing</div>
            </div>
          </div>

          {/* Critical Issues Alert */}
          {criticalIssues.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="handwritten-text text-red-800">
                <strong>Critical Pricing Issues:</strong> {criticalIssues.length} products have cost prices higher than selling prices, 
                resulting in guaranteed losses on every sale.
              </AlertDescription>
            </Alert>
          )}

          {/* Issue List */}
          {pricingIssues.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pricingIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getIssueIcon(issue.issueType)}
                    <div>
                      <span className="font-medium handwritten-text">{issue.name}</span>
                      <p className="text-sm text-gray-600 handwritten-text">SKU: {issue.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getIssueColor(issue.issueType)}>
                      {issue.issueType.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    <p className="text-xs text-gray-600 handwritten-text mt-1">
                      {getIssueDescription(issue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Healthy State */}
          {pricingIssues.length === 0 && !isLoading && (
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 handwritten-text font-medium">All product pricing looks healthy!</p>
              <p className="text-sm text-green-700 handwritten-text">Cost prices are below selling prices with adequate margins.</p>
            </div>
          )}

          {/* Refresh Button */}
          <div className="flex justify-center">
            <Button
              onClick={fetchPricingAudit}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="handwritten-text"
            >
              {isLoading ? "Auditing..." : "Refresh Audit"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}