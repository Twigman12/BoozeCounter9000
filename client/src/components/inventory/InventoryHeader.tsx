/**
 * L.O.G. Framework - Granular Component: Inventory Header
 * Single Responsibility: Display application header with navigation
 */

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Package2, Map, Camera } from "lucide-react";
import { Link } from "wouter";
import { useLogger } from "@/hooks/useLogger";

interface InventoryHeaderProps {
  isWeatherDataActive?: boolean;
  isVisionApiActive?: boolean;
  sessionCount?: number;
}

function InventoryHeader({ 
  isWeatherDataActive = true, 
  isVisionApiActive = false,
  sessionCount = 0
}: InventoryHeaderProps) {
  const { logUserAction } = useLogger('InventoryHeader');

  const handleRoadmapClick = () => {
    logUserAction('navigate_to_roadmap', { currentSessionCount: sessionCount });
  };

  return (
    <header className="glass-panel border-b-0 shadow-lg mb-8">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="future-card p-4 neon-glow">
              <Package2 className="text-4xl neon-text" />
            </div>
            <div>
              <h1 className="text-4xl marker-title highlight highlight-yellow">
                Booze Counter 9000
              </h1>
              <p className="text-lg sketch-text mt-1">
                AI-Powered Beverage Inventory Management
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-3">
              <Link href="/roadmap">
                <button 
                  className="future-button"
                  onClick={handleRoadmapClick}
                >
                  <Map className="w-5 h-5 inline mr-2" />
                  Project Roadmap
                </button>
              </Link>
            </nav>
            
            {isWeatherDataActive && (
              <div className="glass-panel px-4 py-2 rounded-full flex items-center space-x-2">
                <BadgeCheck className="text-green-500" />
                <span className="marker-text">Live Weather</span>
              </div>
            )}
            
            {isVisionApiActive && (
              <div className="glass-panel px-4 py-2 rounded-full flex items-center space-x-2">
                <Camera className="text-purple-500" />
                <span className="marker-text">Vision Active</span>
              </div>
            )}
            
            <div className="future-card px-6 py-2 pulse-glow">
              <span className="marker-text font-bold">Session #{sessionCount || 'New'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default React.memo(InventoryHeader);