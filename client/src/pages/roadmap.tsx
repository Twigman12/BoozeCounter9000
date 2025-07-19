import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Target, Star, Zap, TrendingUp, Shield, Globe, Smartphone, BarChart3, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function RoadmapPage() {
  const roadmapItems = [
    {
      phase: "Phase 1: Foundation",
      status: "completed",
      timeline: "June 2025",
      features: [
        { name: "PostgreSQL Database Architecture", status: "completed", priority: "critical" },
        { name: "18 Authentic Beverage Products", status: "completed", priority: "high" },
        { name: "Google Cloud Vision API Integration", status: "completed", priority: "high" },
        { name: "Multi-Pack Barcode Support", status: "completed", priority: "medium" },
        { name: "Session-Based Inventory Tracking", status: "completed", priority: "high" },
        { name: "Yellow Notepad UI Design", status: "completed", priority: "medium" }
      ]
    },
    {
      phase: "Phase 2: Business Intelligence",
      status: "in-progress", 
      timeline: "July 2025",
      features: [
        { name: "QuickBooks API Integration", status: "completed", priority: "high" },
        { name: "Real-Time Cost Analysis Dashboard", status: "completed", priority: "high" },
        { name: "Automated Reorder Point Alerts", status: "completed", priority: "medium" },
        { name: "Supplier Performance Analytics", status: "completed", priority: "medium" },
        { name: "Profit Margin Tracking", status: "completed", priority: "high" },
        { name: "Tax Compliance Reporting", status: "planned", priority: "medium" }
      ]
    },
    {
      phase: "Phase 3: POS Integration",
      status: "planned",
      timeline: "August 2025", 
      features: [
        { name: "Square/Stripe Payment Integration", status: "planned", priority: "critical" },
        { name: "Real-Time Sales Sync", status: "planned", priority: "high" },
        { name: "Customer Analytics Dashboard", status: "planned", priority: "medium" },
        { name: "Dynamic Pricing Engine", status: "planned", priority: "high" },
        { name: "Loyalty Program Integration", status: "planned", priority: "low" },
        { name: "Receipt Scanner for Purchases", status: "planned", priority: "medium" }
      ]
    },
    {
      phase: "Phase 4: Advanced Analytics",
      status: "planned",
      timeline: "September 2025",
      features: [
        { name: "Weather-Based Demand Forecasting", status: "completed", priority: "medium" },
        { name: "Seasonal Trend Analysis", status: "planned", priority: "medium" },
        { name: "AI-Powered Inventory Optimization", status: "planned", priority: "high" },
        { name: "Predictive Ordering System", status: "planned", priority: "high" },
        { name: "Waste Reduction Analytics", status: "planned", priority: "medium" },
        { name: "Custom Report Builder", status: "planned", priority: "low" }
      ]
    },
    {
      phase: "Phase 5: Multi-Location & Scale",
      status: "planned", 
      timeline: "October 2025",
      features: [
        { name: "Multi-Location Management", status: "planned", priority: "critical" },
        { name: "Chain-Wide Inventory Sync", status: "planned", priority: "high" },
        { name: "Regional Supplier Networks", status: "planned", priority: "medium" },
        { name: "Franchise Management Tools", status: "planned", priority: "medium" },
        { name: "Corporate Dashboard", status: "planned", priority: "high" },
        { name: "Bulk Operations Interface", status: "planned", priority: "medium" }
      ]
    },
    {
      phase: "Phase 6: Mobile & Offline",
      status: "planned",
      timeline: "November 2025", 
      features: [
        { name: "Native Mobile App (iOS/Android)", status: "planned", priority: "high" },
        { name: "Offline Inventory Counting", status: "planned", priority: "critical" },
        { name: "Bluetooth Barcode Scanner Support", status: "planned", priority: "high" },
        { name: "Voice Commands Integration", status: "planned", priority: "medium" },
        { name: "Push Notifications", status: "planned", priority: "low" },
        { name: "GPS Location Tracking", status: "planned", priority: "low" }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Target className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      default:
        return <Badge variant="outline">Planned</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "medium":
        return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const totalFeatures = roadmapItems.reduce((acc, phase) => acc + phase.features.length, 0);
  const completedFeatures = roadmapItems.reduce((acc, phase) => 
    acc + phase.features.filter(f => f.status === "completed").length, 0
  );
  const progressPercentage = Math.round((completedFeatures / totalFeatures) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingUp className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold handwritten-text text-white">AInventory Roadmap</h1>
                <p className="text-blue-100 handwritten-text">Strategic Development Timeline</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 handwritten-text"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Inventory
                </Button>
              </Link>
              <div className="text-right text-white">
                <div className="text-2xl font-bold handwritten-text">{progressPercentage}%</div>
                <div className="text-sm text-blue-100">Complete</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Overview */}
        <Card className="notepad-card mb-8">
          <CardHeader>
            <CardTitle className="handwritten-text text-blue-800 flex items-center">
              <BarChart3 className="mr-3 text-blue-600" />
              Development Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold handwritten-text text-green-700">{completedFeatures}</div>
                <div className="text-sm handwritten-text text-gray-600">Features Complete</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold handwritten-text text-yellow-700">
                  {roadmapItems.filter(p => p.status === "in-progress").length}
                </div>
                <div className="text-sm handwritten-text text-gray-600">Phases In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold handwritten-text text-blue-700">{totalFeatures}</div>
                <div className="text-sm handwritten-text text-gray-600">Total Features</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold handwritten-text text-purple-700">6</div>
                <div className="text-sm handwritten-text text-gray-600">Development Phases</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap Timeline */}
        <div className="space-y-8">
          {roadmapItems.map((phase, phaseIndex) => (
            <Card key={phaseIndex} className="notepad-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="handwritten-text text-blue-800 flex items-center">
                    {getStatusIcon(phase.status)}
                    <span className="ml-3">{phase.phase}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(phase.status)}
                    <Badge variant="outline">{phase.timeline}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {phase.features.map((feature, featureIndex) => (
                    <div 
                      key={featureIndex}
                      className={`p-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
                        feature.status === "completed" 
                          ? "bg-green-50 border-green-300" 
                          : feature.status === "in-progress"
                          ? "bg-yellow-50 border-yellow-300"
                          : "bg-gray-50 border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        {getStatusIcon(feature.status)}
                        {getPriorityBadge(feature.priority)}
                      </div>
                      <h4 className="font-semibold handwritten-text text-gray-800 mb-1">
                        {feature.name}
                      </h4>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Milestones */}
        <Card className="notepad-card mt-8">
          <CardHeader>
            <CardTitle className="handwritten-text text-blue-800 flex items-center">
              <Star className="mr-3 text-yellow-500" />
              Key Milestones & Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-semibold handwritten-text text-gray-800">MVP Launch</div>
                    <div className="text-sm handwritten-text text-gray-600">Core inventory system with barcode scanning</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <div>
                    <div className="font-semibold handwritten-text text-gray-800">Business Intelligence Hub</div>
                    <div className="text-sm handwritten-text text-gray-600">QuickBooks integration and cost analytics</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold handwritten-text text-gray-800">POS Integration</div>
                    <div className="text-sm handwritten-text text-gray-600">Real-time sales and payment processing</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="font-semibold handwritten-text text-gray-800">AI-Powered Insights</div>
                    <div className="text-sm handwritten-text text-gray-600">Predictive analytics and optimization</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-semibold handwritten-text text-gray-800">Multi-Location Platform</div>
                    <div className="text-sm handwritten-text text-gray-600">Chain-wide inventory management</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-6 h-6 text-indigo-600" />
                  <div>
                    <div className="font-semibold handwritten-text text-gray-800">Mobile Excellence</div>
                    <div className="text-sm handwritten-text text-gray-600">Native apps with offline capabilities</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="notepad-card mt-8">
          <CardHeader>
            <CardTitle className="handwritten-text text-blue-800 flex items-center">
              <Zap className="mr-3 text-yellow-500" />
              Technology Evolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-dashed border-green-300">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold handwritten-text text-gray-800">Database</div>
                <div className="text-sm handwritten-text text-gray-600">PostgreSQL + Drizzle ORM</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
                <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold handwritten-text text-gray-800">APIs</div>
                <div className="text-sm handwritten-text text-gray-600">Google Cloud Vision</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-dashed border-purple-300">
                <Smartphone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold handwritten-text text-gray-800">Frontend</div>
                <div className="text-sm handwritten-text text-gray-600">React + TypeScript</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border-2 border-dashed border-orange-300">
                <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="font-semibold handwritten-text text-gray-800">Analytics</div>
                <div className="text-sm handwritten-text text-gray-600">Real-time Dashboards</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}