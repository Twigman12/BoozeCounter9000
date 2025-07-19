/**
 * Magical Interactive Book Interface for Booze Counter 9000
 * Using react-pageflip for realistic page turning
 */

import { useRef, useState, useCallback, forwardRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Product } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, BookOpen, Home, MoveHorizontal } from 'lucide-react';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import ProductSelector from '@/components/inventory/ProductSelector';
import QuantityInput from '@/components/inventory/QuantityInput';
import WeatherDashboard from '@/components/WeatherDashboard';
import CostAnalysisDashboard from '@/components/CostAnalysisDashboard';
import QuickBooksIntegration from '@/components/QuickBooksIntegration';
import SupplierAnalytics from '@/components/SupplierAnalytics';
import BarcodeScanner from '@/components/inventory/BarcodeScanner';
import BarcodeScannerDemo from '@/components/inventory/BarcodeScannerDemo';

// Page component wrapper
const Page = forwardRef<HTMLDivElement, { children: React.ReactNode; pageNumber?: number }>(
  ({ children, pageNumber }, ref) => {
    return (
      <div ref={ref} className="book-page">
        {children}
        {pageNumber && (
          <div className={`page-number ${pageNumber % 2 === 0 ? 'page-number-left' : 'page-number-right'}`}>
            {pageNumber}
          </div>
        )}
      </div>
    );
  }
);

Page.displayName = 'Page';

// Book Cover component
const BookCover = forwardRef<HTMLDivElement, { title: string; subtitle: string }>(
  ({ title, subtitle }, ref) => {
    return (
      <div ref={ref} className="book-cover book-page">
        <div className="ornament">⚜️</div>
        <h1 className="book-title gold-text">{title}</h1>
        <h2 className="book-subtitle">{subtitle}</h2>
        <div className="ornament">⚜️</div>
        <div style={{ marginTop: 'auto' }}>
          <p className="book-subtitle" style={{ fontSize: '1rem', opacity: 0.7 }}>
            Professional Inventory Management System
          </p>
        </div>
      </div>
    );
  }
);

BookCover.displayName = 'BookCover';

export default function BookInventory() {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [scannerMode, setScannerMode] = useState<'camera' | 'demo'>('demo');
  const { isMobile, isTouch } = useMobileDetection();
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  
  // Fetch products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Hide swipe hint after first page turn
  useEffect(() => {
    if (currentPage > 0) {
      setShowSwipeHint(false);
    }
  }, [currentPage]);

  // Navigation functions
  const flipNext = useCallback(() => {
    bookRef.current?.pageFlip().flipNext();
  }, []);

  const flipPrev = useCallback(() => {
    bookRef.current?.pageFlip().flipPrev();
  }, []);

  const flipToPage = useCallback((pageNum: number) => {
    bookRef.current?.pageFlip().flip(pageNum);
  }, []);

  const handleProductSelected = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const handleQuantitySubmitted = useCallback((product: Product, quantity: number) => {
    console.log('Item added:', product.name, quantity);
    // Add your inventory logic here
  }, []);

  return (
    <div className="book-container">
      <div className="book-shadow" />
      
      {/* Navigation Controls */}
      <div className="fixed top-8 left-8 z-50 flex gap-4">
        <button
          onClick={() => flipToPage(0)}
          className="book-button flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Cover
        </button>
        <button
          onClick={() => flipToPage(2)}
          className="book-button flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Contents
        </button>
      </div>

      {/* Page indicator */}
      <div className="fixed top-8 right-8 z-50 text-ink-secondary">
        Page {currentPage + 1} of 12
      </div>

      {/* Mobile swipe hint */}
      {isMobile && showSwipeHint && currentPage === 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
          <MoveHorizontal className="w-4 h-4" />
          <span className="text-sm">Swipe to turn pages</span>
        </div>
      )}

      {/* Page flip controls */}
      <button
        onClick={flipPrev}
        className="fixed left-8 top-1/2 -translate-y-1/2 z-50 book-button rounded-full p-3"
        disabled={currentPage === 0}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={flipNext}
        className="fixed right-8 top-1/2 -translate-y-1/2 z-50 book-button rounded-full p-3"
        disabled={currentPage >= 11}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* The Book */}
      <HTMLFlipBook
        ref={bookRef}
        width={isMobile ? 350 : 500}
        height={isMobile ? 500 : 700}
        size="stretch"
        minWidth={280}
        maxWidth={600}
        minHeight={400}
        maxHeight={800}
        showCover={true}
        flippingTime={1000}
        usePortrait={true}
        startZIndex={0}
        autoSize={true}
        maxShadowOpacity={0.5}
        showPageCorners={!isMobile}
        disableFlipByClick={false}
        className="book-flip"
        style={{}}
        startPage={0}
        drawShadow={true}
        useMouseEvents={true}
        renderOnlyPageLengthChange={false}
        swipeDistance={50}
        clickEventForward={true}
        onFlip={(e) => setCurrentPage(e.data)}
        mobileScrollSupport={true}
      >
        {/* Front Cover */}
        <BookCover
          title="Booze Counter 9000"
          subtitle="Inventory Management Grimoire"
        />

        {/* Title Page */}
        <Page pageNumber={1}>
          <div className="text-center">
            <h1 className="chapter-header">Booze Counter 9000</h1>
            <p className="text-lg mb-8">Advanced Inventory Management System</p>
            <div className="ornament">⚡</div>
            <p className="mt-8 text-sm italic">Version 2.1 • Resonance Framework</p>
          </div>
        </Page>

        {/* Table of Contents */}
        <Page pageNumber={2}>
          <h2 className="chapter-header">Table of Contents</h2>
          <div className="space-y-4">
            <button
              onClick={() => flipToPage(3)}
              className="w-full flex justify-between items-center py-3 px-2 border-b border-neutral-300 hover:bg-neutral-50 transition-all duration-200 text-left group"
            >
              <span className="group-hover:text-ink-accent transition-colors font-medium">Chapter 1: Product Selection & Scanner</span>
              <span className="text-ink-secondary group-hover:text-ink-accent transition-colors">Page 3 →</span>
            </button>
            <button
              onClick={() => flipToPage(4)}
              className="w-full flex justify-between items-center py-3 px-2 border-b border-neutral-300 hover:bg-neutral-50 transition-all duration-200 text-left group"
            >
              <span className="group-hover:text-ink-accent transition-colors font-medium">Chapter 2: Quantity Entry</span>
              <span className="text-ink-secondary group-hover:text-ink-accent transition-colors">Page 4 →</span>
            </button>
            <button
              onClick={() => flipToPage(5)}
              className="w-full flex justify-between items-center py-3 px-2 border-b border-neutral-300 hover:bg-neutral-50 transition-all duration-200 text-left group"
            >
              <span className="group-hover:text-ink-accent transition-colors font-medium">Chapter 3: Weather Analytics</span>
              <span className="text-ink-secondary group-hover:text-ink-accent transition-colors">Page 5 →</span>
            </button>
            <button
              onClick={() => flipToPage(6)}
              className="w-full flex justify-between items-center py-3 px-2 border-b border-neutral-300 hover:bg-neutral-50 transition-all duration-200 text-left group"
            >
              <span className="group-hover:text-ink-accent transition-colors font-medium">Chapter 4: Cost Analysis</span>
              <span className="text-ink-secondary group-hover:text-ink-accent transition-colors">Page 6 →</span>
            </button>
            <button
              onClick={() => flipToPage(7)}
              className="w-full flex justify-between items-center py-3 px-2 border-b border-neutral-300 hover:bg-neutral-50 transition-all duration-200 text-left group"
            >
              <span className="group-hover:text-ink-accent transition-colors font-medium">Chapter 5: QuickBooks Integration</span>
              <span className="text-ink-secondary group-hover:text-ink-accent transition-colors">Page 7 →</span>
            </button>
            <button
              onClick={() => flipToPage(8)}
              className="w-full flex justify-between items-center py-3 px-2 border-b border-neutral-300 hover:bg-neutral-50 transition-all duration-200 text-left group"
            >
              <span className="group-hover:text-ink-accent transition-colors font-medium">Chapter 6: Supplier Performance</span>
              <span className="text-ink-secondary group-hover:text-ink-accent transition-colors">Page 8 →</span>
            </button>
          </div>
        </Page>

        {/* Chapter 1: Product Selection */}
        <Page pageNumber={3}>
          <h2 className="chapter-header">Chapter 1</h2>
          <h3 className="section-title text-center mb-8">Product Selection</h3>
          
          {/* Barcode Scanner Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 text-ink-accent">Barcode Scanner</h4>
            
            {/* Tab selection */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setScannerMode('camera')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  scannerMode === 'camera' 
                    ? 'bg-ink-accent text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Camera Scanner
              </button>
              <button
                onClick={() => setScannerMode('demo')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  scannerMode === 'demo' 
                    ? 'bg-ink-accent text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Demo Mode
              </button>
            </div>
            
            {scannerMode === 'camera' ? (
              <BarcodeScanner
                onProductScanned={(product) => {
                  setSelectedProduct(product);
                  handleProductSelected(product);
                }}
                onBarcodeDetected={(barcode) => {
                  console.log('Barcode detected:', barcode);
                }}
              />
            ) : (
              <BarcodeScannerDemo />
            )}
          </div>
          
          <div className="my-4 text-center text-ink-secondary">
            <span>— or —</span>
          </div>
          
          {/* Manual Product Selection */}
          <ProductSelector
            selectedProduct={selectedProduct}
            onProductSelected={handleProductSelected}
            onProductCleared={() => setSelectedProduct(null)}
          />
        </Page>

        {/* Chapter 2: Quantity Entry */}
        <Page pageNumber={4}>
          <h2 className="chapter-header">Chapter 2</h2>
          <h3 className="section-title text-center mb-8">Quantity Entry</h3>
          <QuantityInput
            selectedProduct={selectedProduct}
            onQuantitySubmitted={handleQuantitySubmitted}
            disabled={false}
          />
          {!selectedProduct && (
            <div className="text-center mt-8 text-ink-secondary italic">
              Please select a product from Chapter 1 first
            </div>
          )}
        </Page>

        {/* Chapter 3: Weather Analytics */}
        <Page pageNumber={5}>
          <h2 className="chapter-header">Chapter 3</h2>
          <h3 className="section-title text-center mb-8">Weather Intelligence</h3>
          <div className="book-section" style={{ height: '500px', overflow: 'auto' }}>
            <WeatherDashboard />
          </div>
        </Page>

        {/* Chapter 4: Cost Analysis */}
        <Page pageNumber={6}>
          <h2 className="chapter-header">Chapter 4</h2>
          <h3 className="section-title text-center mb-8">Cost Analysis</h3>
          <div className="book-section" style={{ height: '500px', overflow: 'auto' }}>
            <CostAnalysisDashboard />
          </div>
        </Page>

        {/* Chapter 5: QuickBooks */}
        <Page pageNumber={7}>
          <h2 className="chapter-header">Chapter 5</h2>
          <h3 className="section-title text-center mb-8">QuickBooks Sync</h3>
          <div className="book-section" style={{ height: '500px', overflow: 'auto' }}>
            <QuickBooksIntegration />
          </div>
        </Page>

        {/* Chapter 6: Supplier Analytics */}
        <Page pageNumber={8}>
          <h2 className="chapter-header">Chapter 6</h2>
          <h3 className="section-title text-center mb-8">Supplier Performance</h3>
          <div className="book-section" style={{ height: '500px', overflow: 'auto' }}>
            <SupplierAnalytics />
          </div>
        </Page>

        {/* Session Summary */}
        <Page pageNumber={9}>
          <h2 className="chapter-header">Session Summary</h2>
          <div className="book-section">
            <div className="book-card">
              <h3 className="section-title">Today's Inventory Count</h3>
              <p>Items Counted: 0</p>
              <p>Total Value: $0.00</p>
              <p>Session Duration: 0 minutes</p>
            </div>
            <button className="book-button w-full mt-4">
              Sync to MarginEdge
            </button>
          </div>
        </Page>

        {/* Notes Page */}
        <Page pageNumber={10}>
          <h2 className="chapter-header">Notes & Observations</h2>
          <div className="space-y-4">
            <textarea
              className="w-full h-64 p-4 book-input"
              placeholder="Write your inventory notes here..."
              style={{ borderStyle: 'solid', borderRadius: '8px' }}
            />
            <button className="book-button">Save Notes</button>
          </div>
        </Page>

        {/* Credits */}
        <Page pageNumber={11}>
          <div className="text-center">
            <h2 className="chapter-header">Credits</h2>
            <div className="ornament">✨</div>
            <p className="mt-8">Built with React & Magic</p>
            <p className="mt-4 text-sm">Powered by L.O.G. Framework</p>
            <p className="mt-2 text-sm">Resonance v2.1</p>
          </div>
        </Page>

        {/* Back Cover */}
        <Page pageNumber={12}>
          <div className="book-cover flex items-center justify-center">
            <div className="text-center">
              <div className="ornament text-4xl">🔮</div>
              <p className="book-subtitle mt-4">The End</p>
            </div>
          </div>
        </Page>
      </HTMLFlipBook>
    </div>
  );
}