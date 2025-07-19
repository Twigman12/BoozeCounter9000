import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, Sun, CloudRain, Snowflake, TrendingUp, AlertTriangle, RefreshCw, MapPin } from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  forecast: {
    date: string;
    temp_high: number;
    temp_low: number;
    condition: string;
  }[];
}

interface DemandForecast {
  productCategory: string;
  demandMultiplier: number;
  reasoning: string;
  recommendedAction: string;
}

interface ReorderSuggestion {
  productId: number;
  productName: string;
  currentStock: number;
  normalParLevel: number;
  weatherAdjustedParLevel: number;
  suggestedOrderQuantity: number;
  reasoning: string;
  priority: string;
}

interface WeatherForecastResponse {
  location: string;
  weather: WeatherData;
  demandForecasts: DemandForecast[];
  reorderSuggestions: ReorderSuggestion[];
  summary: {
    totalSuggestions: number;
    highPriority: number;
    estimatedAdditionalRevenue: number;
  };
}

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("New York");

  const fetchWeatherForecast = async (location: string = selectedLocation) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/weather-forecast/${encodeURIComponent(location)}`);
      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Weather forecast error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherForecast();
  }, [selectedLocation]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'clouds':
      case 'cloudy':
        return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'snow':
        return <Snowflake className="w-6 h-6 text-blue-300" />;
      default:
        return <Cloud className="w-6 h-6 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === "High" 
      ? "bg-red-100 text-red-800" 
      : "bg-orange-100 text-orange-800";
  };

  const getDemandColor = (multiplier: number) => {
    if (multiplier >= 1.3) return "bg-red-100 text-red-800";
    if (multiplier >= 1.1) return "bg-yellow-100 text-yellow-800";
    if (multiplier <= 0.9) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  if (!weatherData) {
    return (
      <Card className="notepad-card">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Weather & Overview */}
      <Card className="notepad-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="handwritten-text text-blue-800 flex items-center">
              {getWeatherIcon(weatherData.weather.condition)}
              <span className="ml-3">Weather Intelligence</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-48 handwritten-text bg-blue-50 border-blue-200">
                  <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="Miami">Miami</SelectItem>
                  <SelectItem value="Chicago">Chicago</SelectItem>
                  <SelectItem value="Phoenix">Phoenix</SelectItem>
                  <SelectItem value="Seattle">Seattle</SelectItem>
                  <SelectItem value="Denver">Denver</SelectItem>
                  <SelectItem value="Las Vegas">Las Vegas</SelectItem>
                  <SelectItem value="Boston">Boston</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => fetchWeatherForecast()}
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
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold handwritten-text text-blue-700">
                {weatherData.weather.temperature}°F
              </div>
              <div className="text-sm handwritten-text text-gray-600">
                {weatherData.weather.condition} • {weatherData.location}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold handwritten-text text-green-700">
                {weatherData.summary.totalSuggestions}
              </div>
              <div className="text-sm handwritten-text text-gray-600">Reorder Suggestions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold handwritten-text text-purple-700">
                ${weatherData.summary.estimatedAdditionalRevenue}
              </div>
              <div className="text-sm handwritten-text text-gray-600">Potential Revenue</div>
            </div>
          </div>

          {lastUpdated && (
            <div className="text-xs handwritten-text text-gray-500 text-center mt-4">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demand Forecasts */}
      <Card className="notepad-card">
        <CardHeader>
          <CardTitle className="handwritten-text text-blue-800 flex items-center">
            <TrendingUp className="mr-3 text-green-600" />
            Demand Forecasts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weatherData.demandForecasts.map((forecast, index) => (
              <div key={index} className="p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold handwritten-text text-blue-800">
                    {forecast.productCategory}
                  </div>
                  <Badge className={getDemandColor(forecast.demandMultiplier)}>
                    {forecast.demandMultiplier > 1 ? '+' : ''}{Math.round((forecast.demandMultiplier - 1) * 100)}%
                  </Badge>
                </div>
                <p className="text-sm handwritten-text text-gray-700 mb-2">
                  {forecast.reasoning}
                </p>
                <p className="text-xs handwritten-text text-blue-600 font-medium">
                  💡 {forecast.recommendedAction}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Reorder Suggestions */}
      <Card className="notepad-card">
        <CardHeader>
          <CardTitle className="handwritten-text text-blue-800 flex items-center">
            <AlertTriangle className="mr-3 text-orange-600" />
            Weather-Based Reorder Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weatherData.reorderSuggestions.slice(0, 5).map((suggestion, index) => (
              <div key={index} className="p-3 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold handwritten-text text-orange-800">
                    {suggestion.productName}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                    <Badge variant="outline">
                      Order {suggestion.suggestedOrderQuantity} units
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm handwritten-text text-gray-700">
                  <div>
                    <span className="font-medium">Current:</span> {suggestion.currentStock}
                  </div>
                  <div>
                    <span className="font-medium">Normal Par:</span> {suggestion.normalParLevel}
                  </div>
                  <div>
                    <span className="font-medium">Weather Par:</span> {suggestion.weatherAdjustedParLevel}
                  </div>
                </div>
                <p className="text-xs handwritten-text text-orange-600 mt-2">
                  {suggestion.reasoning}
                </p>
              </div>
            ))}
          </div>
          
          {weatherData.reorderSuggestions.length > 5 && (
            <div className="text-center mt-4">
              <div className="text-sm handwritten-text text-gray-600">
                + {weatherData.reorderSuggestions.length - 5} more suggestions available
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5-Day Forecast */}
      <Card className="notepad-card">
        <CardHeader>
          <CardTitle className="handwritten-text text-blue-800">5-Day Outlook</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {weatherData.weather.forecast.map((day, index) => (
              <div key={index} className="text-center p-3 bg-yellow-100 rounded-lg border-2 border-dashed border-yellow-300">
                <div className="text-xs handwritten-text text-gray-600 mb-1">
                  {day.date}
                </div>
                <div className="mb-2">
                  {getWeatherIcon(day.condition)}
                </div>
                <div className="text-sm font-bold handwritten-text text-gray-800">
                  {day.temp_high}°
                </div>
                <div className="text-xs handwritten-text text-gray-600">
                  {day.temp_low}°
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}