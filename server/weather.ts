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

import { apiManager, sanitizeInput, logApiUsage } from './api-manager';

// Simple in-memory cache for weather data
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();

// Calculate heat index (feels like temperature) based on temperature and humidity
function calculateHeatIndex(tempF: number, humidity: number): number {
  if (tempF < 80 || humidity < 40) {
    return tempF; // Heat index formula only applies to hot, humid conditions
  }
  
  const T = tempF;
  const RH = humidity;
  
  // Rothfusz regression equation for heat index
  let HI = -42.379 + 
           2.04901523 * T + 
           10.14333127 * RH - 
           0.22475541 * T * RH - 
           6.83783e-3 * T * T - 
           5.481717e-2 * RH * RH + 
           1.22874e-3 * T * T * RH + 
           8.5282e-4 * T * RH * RH - 
           1.99e-6 * T * T * RH * RH;
           
  return Math.round(HI);
}

export async function getWeatherData(location: string = "New York"): Promise<WeatherData> {
  // Sanitize input
  const sanitizedLocation = sanitizeInput(location);
  
  // Check cache first
  const cacheKey = sanitizedLocation.toLowerCase();
  const config = apiManager.getConfig('weather');
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < config.cacheTTL) {
    return cached.data;
  }

  // Check rate limits
  if (!apiManager.checkRateLimit('weather')) {
    throw new Error('API rate limit reached. Please try again later.');
  }

  // Get API key
  const apiKey = config.key;
  
  if (!apiKey) {
    // Demo mode with realistic seasonal weather patterns
    const currentMonth = new Date().getMonth(); // 0-11
    const currentHour = new Date().getHours();
    
    // Generate realistic temperature based on season and time
    let baseTemp = 70; // Default
    if (currentMonth >= 11 || currentMonth <= 2) baseTemp = 35; // Winter
    else if (currentMonth >= 3 && currentMonth <= 5) baseTemp = 65; // Spring
    else if (currentMonth >= 6 && currentMonth <= 8) baseTemp = 85; // Summer
    else baseTemp = 60; // Fall
    
    // Add daily variation
    const tempVariation = Math.sin((currentHour - 6) * Math.PI / 12) * 15;
    const currentTemp = Math.round(baseTemp + tempVariation + (Math.random() - 0.5) * 10);
    
    const conditions = ["Clear", "Clouds", "Rain"];
    const currentCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    // Generate 5-day forecast
    const forecast = Array.from({ length: 5 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      temp_high: currentTemp + (Math.random() - 0.5) * 20,
      temp_low: currentTemp - 15 + (Math.random() - 0.5) * 10,
      condition: conditions[Math.floor(Math.random() * conditions.length)]
    }));
    
    const weatherData = {
      temperature: currentTemp,
      condition: currentCondition,
      humidity: Math.round(40 + Math.random() * 40),
      forecast
    };

    // Cache the demo data
    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
    return weatherData;
  }

  try {
    // Current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${sanitizedLocation}&appid=${apiKey}&units=imperial`
    );
    
    apiManager.recordApiCall('weather', currentResponse.ok);
    logApiUsage('weather', 'current', currentResponse.status);
    
    if (!currentResponse.ok) {
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }
    
    const currentData = await currentResponse.json();
    
    // 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${sanitizedLocation}&appid=${apiKey}&units=imperial`
    );
    
    apiManager.recordApiCall('weather', forecastResponse.ok);
    logApiUsage('weather', 'forecast', forecastResponse.status);
    
    const forecastData = await forecastResponse.json();
    
    // Process forecast (daily highs)
    const dailyForecast = forecastData.list
      .filter((_: any, index: number) => index % 8 === 0) // Every 8th item = daily
      .slice(0, 5)
      .map((item: any) => ({
        date: new Date(item.dt * 1000).toLocaleDateString(),
        temp_high: Math.round(item.main.temp_max),
        temp_low: Math.round(item.main.temp_min),
        condition: item.weather[0].main
      }));

    const weatherData = {
      temperature: Math.round(currentData.main.temp),
      condition: currentData.weather[0].main,
      humidity: currentData.main.humidity,
      forecast: dailyForecast
    };

    // Cache successful API response
    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
    return weatherData;
    
  } catch (error) {
    console.error('Weather API error:', error);
    throw error;
  }
}

export function calculateDemandForecast(weatherData: WeatherData): DemandForecast[] {
  const forecasts: DemandForecast[] = [];
  const temp = weatherData.temperature;
  const humidity = weatherData.humidity;
  const condition = weatherData.condition;
  
  // Calculate heat index for perceived temperature
  const heatIndex = calculateHeatIndex(temp, humidity);
  
  // Beer demand logic with humidity considerations
  if (temp >= 60) {
    let weatherDescription = "";
    let multiplier = 1.2;
    
    if (heatIndex >= 85) {
      weatherDescription = `Hot and muggy conditions (${temp}°F, ${humidity}% humidity, feels like ${heatIndex}°F)`;
      multiplier = 1.5; // Higher demand for cold drinks in oppressive heat
    } else if (temp >= 75 && humidity >= 70) {
      weatherDescription = `Warm and humid weather (${temp}°F, ${humidity}% humidity)`;
      multiplier = 1.4;
    } else if (temp >= 75) {
      weatherDescription = `Pleasant warm weather (${temp}°F)`;
      multiplier = 1.3;
    } else {
      weatherDescription = `Mild weather (${temp}°F)`;
      multiplier = 1.2;
    }
    
    forecasts.push({
      productCategory: "Beer",
      demandMultiplier: multiplier,
      reasoning: `${weatherDescription} increases beer consumption`,
      recommendedAction: multiplier >= 1.4 ? "Increase beer orders by 40-50%. Focus on light, refreshing beers." : "Increase beer orders by 20-30%. All beer types in demand."
    });
  } else if (temp <= 50) {
    forecasts.push({
      productCategory: "Beer", 
      demandMultiplier: 0.8,
      reasoning: `Cold weather (${temp}°F) reduces beer consumption`,
      recommendedAction: "Reduce beer orders by 20%. Focus on darker, heavier beers."
    });
  }
  
  // Wine demand logic
  if (temp <= 60 || condition === "Rain") {
    forecasts.push({
      productCategory: "Wine",
      demandMultiplier: 1.2,
      reasoning: `Cool weather/rain (${temp}°F, ${condition}) increases wine consumption`,
      recommendedAction: "Increase wine orders by 20%. Focus on reds and full-bodied wines."
    });
  }
  
  // Spirits demand logic  
  if (temp <= 45) {
    forecasts.push({
      productCategory: "Spirits",
      demandMultiplier: 1.3,
      reasoning: `Cold weather (${temp}°F) increases cocktail and spirits consumption`,
      recommendedAction: "Increase spirits orders by 30%. Focus on whiskey, rum, and hot cocktail ingredients."
    });
  }
  
  // Rainy day logic
  if (condition === "Rain" || condition === "Thunderstorm") {
    forecasts.push({
      productCategory: "All Categories",
      demandMultiplier: 1.15,
      reasoning: "Rainy weather increases overall alcohol consumption as customers stay longer",
      recommendedAction: "Increase all inventory by 15%. Prepare for longer customer visits."
    });
  }
  
  return forecasts;
}

export function generateWeatherBasedReorders(forecasts: DemandForecast[], currentInventory: any[]): any[] {
  const reorderSuggestions = [];
  
  for (const forecast of forecasts) {
    let categoryProducts = currentInventory.filter(product => {
      if (forecast.productCategory === "All Categories") return true;
      
      // Map category names to your database categories
      const categoryMap: { [key: string]: number } = {
        "Beer": 1,
        "Wine": 2, 
        "Spirits": 3
      };
      
      return product.categoryId === categoryMap[forecast.productCategory];
    });

    // If no exact category matches, use name-based matching for beer products
    if (categoryProducts.length === 0 && forecast.productCategory === "Beer") {
      categoryProducts = currentInventory.filter(product => 
        product.name.toLowerCase().includes('beer') ||
        product.name.toLowerCase().includes('budweiser') ||
        product.name.toLowerCase().includes('stella') ||
        product.name.toLowerCase().includes('heineken')
      );
    }

    // If still no matches, use top products for demonstration
    if (categoryProducts.length === 0) {
      categoryProducts = currentInventory.slice(0, 3);
    }
    
    for (const product of categoryProducts.slice(0, 5)) { // Limit to top 5 per category
      const currentStock = product.lastCountQuantity || Math.floor(Math.random() * 25 + 15);
      const parLevel = product.parLevel || Math.floor(Math.random() * 40 + 30);
      const adjustedParLevel = Math.round(parLevel * forecast.demandMultiplier);
      
      if (currentStock < adjustedParLevel) {
        reorderSuggestions.push({
          productId: product.id,
          productName: product.name,
          currentStock,
          normalParLevel: parLevel,
          weatherAdjustedParLevel: adjustedParLevel,
          suggestedOrderQuantity: adjustedParLevel - currentStock,
          reasoning: forecast.reasoning,
          priority: forecast.demandMultiplier > 1.3 ? "High" : "Medium"
        });
      }
    }
  }
  
  return reorderSuggestions.sort((a, b) => b.suggestedOrderQuantity - a.suggestedOrderQuantity);
}