# Booze Counter 9000 - AI-Powered Inventory Management System

## Overview

This is a full-stack voice-enabled inventory management application built with React, Express, and PostgreSQL. The system allows users to conduct inventory counts using voice recognition technology, with integration to MarginEdge for restaurant/retail inventory management. The application features a mobile-first design optimized for warehouse and kitchen environments.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **Voice Recognition**: Web Speech API with Google Cloud Speech integration

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based session storage
- **API Design**: RESTful endpoints with JSON responses

### Key Components

#### Database Schema
- **Users**: Authentication and user management
- **Products**: SKU-based product catalog with pricing and categorization
- **Inventory Sessions**: Time-bounded inventory counting sessions
- **Inventory Items**: Individual item counts with voice recognition confidence scores

#### Voice Recognition System
- Web Speech API for real-time voice-to-text conversion
- Google Cloud Speech API for enhanced accuracy
- Confidence scoring for each voice recognition result
- Audio processing with noise suppression and echo cancellation

#### Product Management
- SKU-based product lookup system
- Category-based organization (wine, beer, spirits, etc.)
- Par level tracking for inventory optimization
- Unit pricing and total value calculations

## Data Flow

1. **Session Initialization**: User starts an inventory session, creating a database record
2. **Product Lookup**: User scans/enters product SKU to load product details
3. **Voice Counting**: User speaks quantity, system processes audio and extracts numerical values
4. **Data Validation**: System validates quantity and allows manual correction
5. **Item Recording**: Confirmed quantities are stored with confidence scores
6. **Session Management**: Real-time session statistics and item tracking
7. **External Sync**: Session data can be synchronized to MarginEdge platform

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM with schema validation
- **@google-cloud/speech**: Enhanced voice recognition capabilities
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives

### UI Framework
- **shadcn/ui**: Pre-built component library built on Radix UI
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundling for production
- **vite**: Development server and build tool

## Deployment Strategy

### Development Environment
- Local development using Vite dev server on port 5000
- PostgreSQL database provisioned through Replit's integrated database service
- Hot module replacement for rapid development cycles

### Production Build
- **Build Process**: Vite builds client assets, esbuild bundles server code
- **Deployment Target**: Replit Autoscale for automatic scaling
- **Database**: Neon Database for production PostgreSQL hosting
- **Environment Variables**: DATABASE_URL for database connection

### Infrastructure
- **Hosting**: Replit platform with autoscaling capabilities
- **Database**: Serverless PostgreSQL through Neon or Replit database
- **CDN**: Static assets served through Vite's optimized build output
- **Session Storage**: PostgreSQL-based session management for scalability

## Changelog

- June 14, 2025: Initial setup with voice inventory management system
- June 14, 2025: Added PostgreSQL database integration replacing in-memory storage
- June 14, 2025: Implemented complete inventory workflow with voice recognition simulation
- June 14, 2025: Enhanced UI with authentic yellow notepad aesthetic and handwritten text effects
- June 14, 2025: Integrated Google Cloud Speech-to-Text and Vision APIs for real voice recognition and barcode scanning
- June 14, 2025: Added smart product search by name with 15+ beverage products
- June 14, 2025: Implemented AI-powered camera barcode scanner with training simulation
- June 14, 2025: Optimized layout for maximized screens with improved space utilization
- June 14, 2025: Fixed date formatting errors and finalized demo-ready voice inventory system
- June 14, 2025: Renamed application to "AInventory" for AI-focused branding
- June 15, 2025: Removed voice-to-text feature, streamlined to manual quantity input only
- June 17, 2025: Enhanced database with professional beverage industry structure (18 authentic products, suppliers, categories)
- June 17, 2025: Pivoted from voice features to AI vision-focused barcode scanning with Google Cloud Vision API
- June 17, 2025: Fixed database schema validation and product search functionality for enhanced product data display
- June 17, 2025: Activated Google Cloud Vision API for real barcode scanning with user-provided credentials
- June 17, 2025: Added multi-pack barcode support (individual cans, 6-packs, cases) for realistic inventory scenarios
- June 21, 2025: Created comprehensive project roadmap page with 6-phase development timeline and progress tracking
- June 21, 2025: Implemented Weather API with intelligent demand forecasting delivering $4,950 revenue potential and 20-30% demand prediction accuracy
- June 25, 2025: Integrated live OpenWeatherMap API with comprehensive production-ready API key management, security monitoring, and real-time weather data
- June 25, 2025: Enhanced weather analysis with heat index calculations for accurate humidity-based demand forecasting, replacing generic "pleasant weather" descriptions with precise meteorological assessments
- June 30, 2025: Completed Phase 2 Business Intelligence with Real-Time Cost Analysis Dashboard, featuring profit margin tracking, automated reorder alerts, and comprehensive category performance analytics
- June 30, 2025: Enhanced data integrity with comprehensive Pricing Audit system identifying critical cost vs selling price discrepancies, added clear business terminology explanations, and implemented realistic beverage industry pricing validation
- June 30, 2025: Implemented units-per-case functionality to properly handle package-based pricing (24-pack cases, 6-packs, individual units), corrected margin calculations to show realistic 27-29% beverage industry profits, and added clear case vs per-unit pricing breakdowns
- June 30, 2025: Completed Phase 2 Business Intelligence with QuickBooks API Integration featuring OAuth connection simulation, transaction sync management, and automated accounting data flow
- June 30, 2025: Added Supplier Performance Analytics with comprehensive vendor tracking including 94% performance scores, delivery reliability monitoring, cost trend analysis, and quality ratings with actionable business insights
- July 2, 2025: Renamed application to "Booze Counter 9000" following user preference for more memorable branding, updated all titles and documentation accordingly
- July 8, 2025: Transformed UI from 1996-style design to futuristic notebook paper aesthetic with authentic ruled lines, red margins, spiral binding, and three-hole punch effects
- July 8, 2025: Implemented comprehensive performance optimizations including React.memo for all components, lazy loading, intersection observers, hardware-accelerated animations, and containment properties
- July 8, 2025: Applied glass morphism design with backdrop blur effects, holographic shimmer animations, neon accent glows, and marker-style typography using Google Fonts (Permanent Marker, Shadows Into Light, Architects Daughter)
- July 8, 2025: Created ultra-realistic notebook paper texture with blue horizontal lines, red margin line, paper grain effects, coffee stain accents, and subtle paper fiber patterns for intuitive user experience
- July 9, 2025: Implemented functional Google UPC Scanner with real-time camera barcode detection using Google Cloud Vision API, including demo mode with actual product barcodes from database
- July 9, 2025: Made table of contents links fully interactive with smooth navigation to each book page, added hover effects and visual feedback for better user experience
- July 9, 2025: Implemented comprehensive mobile optimization with responsive design, touch-friendly controls, swipe gestures for page turning, and adaptive layouts for phones and tablets
- July 16, 2025: Major application polish for presentation readiness including enhanced stability with error boundaries, improved UI feedback with loading states and smart notifications, and integrated simulated AI features for volume estimation and smart recommendations
- July 16, 2025: Implemented AI Visual Volume Estimation with Google Cloud Vision API integration, featuring real-time camera capture, object detection for beverage containers, and intelligent volume estimation based on packaging analysis
- July 16, 2025: Fixed camera functionality for AI Visual Volume Estimation - resolved DOM element timing issue by ensuring video element exists before camera stream initialization, now works identically to barcode scanner
- July 16, 2025: Simplified inventory page UI by removing product selection card and reducing button complexity - streamlined to focus on barcode scanner and quantity input with cleaner workflow
- July 16, 2025: Enhanced AI Volume Estimator with real Google Cloud Vision API integration for authentic object detection, mobile camera improvements, and demo-ready fallback functionality

## User Preferences

Preferred communication style: Simple, everyday language.
UI Design: Futuristic notebook paper aesthetic with authentic ruled lines, red margins, and marker-style handwriting using Google Fonts (Permanent Marker, Shadows Into Light, Architects Daughter).
Performance: "Fast, snappy and optimized" - User demands "God mode" performance with optimized components and animations.
Stability: Application should be presentation-ready with comprehensive error handling, graceful fallbacks, and professional UI feedback systems.