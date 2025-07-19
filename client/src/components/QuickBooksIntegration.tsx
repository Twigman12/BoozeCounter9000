import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  DollarSign,
  FileText,
  Upload,
  Download
} from "lucide-react";

interface QuickBooksStatus {
  connected: boolean;
  lastSync: string | null;
  companyName?: string;
  totalSynced: number;
  pendingTransactions: number;
}

interface SyncableTransaction {
  id: number;
  type: "inventory_adjustment" | "purchase" | "sale";
  description: string;
  amount: number;
  date: string;
  status: "pending" | "synced" | "error";
}

export default function QuickBooksIntegration() {
  const [qbStatus, setQbStatus] = useState<QuickBooksStatus>({
    connected: false,
    lastSync: null,
    totalSynced: 0,
    pendingTransactions: 0
  });
  
  const [transactions, setTransactions] = useState<SyncableTransaction[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchQBStatus();
    fetchPendingTransactions();
  }, []);

  const fetchQBStatus = async () => {
    try {
      const response = await fetch('/api/quickbooks/status');
      if (response.ok) {
        const status = await response.json();
        setQbStatus(status);
      }
    } catch (error) {
      console.error('Error fetching QuickBooks status:', error);
    }
  };

  const fetchPendingTransactions = async () => {
    // Simulate pending transactions for demo
    const mockTransactions: SyncableTransaction[] = [
      {
        id: 1,
        type: "inventory_adjustment",
        description: "Inventory Count Session #37 - June 30, 2025",
        amount: 150.45,
        date: "2025-06-30",
        status: "pending"
      },
      {
        id: 2,
        type: "purchase",
        description: "Beer Purchase - Budweiser 24-pack (5 cases)",
        amount: 229.95,
        date: "2025-06-29",
        status: "pending"
      },
      {
        id: 3,
        type: "sale",
        description: "Daily Sales Summary - June 28",
        amount: 1847.50,
        date: "2025-06-28",
        status: "synced"
      }
    ];
    setTransactions(mockTransactions);
  };

  const connectToQuickBooks = async () => {
    setIsConnecting(true);
    try {
      // Get the OAuth authorization URL from our backend
      const response = await fetch('/api/quickbooks/auth');
      const data = await response.json();
      
      if (data.authUrl) {
        // Open QuickBooks OAuth in new window
        window.open(data.authUrl, 'quickbooks-oauth', 'width=600,height=700');
        
        // Listen for successful connection
        const checkConnection = setInterval(async () => {
          const statusResponse = await fetch('/api/quickbooks/status');
          const statusData = await statusResponse.json();
          
          if (statusData.connected) {
            clearInterval(checkConnection);
            setQbStatus(statusData);
            setIsConnecting(false);
          }
        }, 2000);
        
        // Stop checking after 5 minutes
        setTimeout(() => {
          clearInterval(checkConnection);
          setIsConnecting(false);
        }, 300000);
      }
    } catch (error) {
      console.error('QuickBooks connection error:', error);
      setIsConnecting(false);
    }
  };

  const syncTransactions = async () => {
    setIsSyncing(true);
    try {
      const pendingIds = transactions.filter(t => t.status === "pending").map(t => t.id);
      
      const response = await fetch('/api/quickbooks/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionIds: pendingIds }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update transaction statuses
        setTransactions(prev => prev.map(t => 
          pendingIds.includes(t.id) ? { ...t, status: "synced" } : t
        ));
        
        // Update QuickBooks status
        setQbStatus(prev => ({
          ...prev,
          lastSync: new Date().toISOString(),
          totalSynced: prev.totalSynced + result.synced,
          pendingTransactions: Math.max(0, prev.pendingTransactions - result.synced)
        }));
      } else {
        console.error('Sync failed:', await response.text());
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "inventory_adjustment": return <FileText className="w-4 h-4 text-blue-600" />;
      case "purchase": return <Upload className="w-4 h-4 text-green-600" />;
      case "sale": return <Download className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "synced": return <Badge className="bg-green-100 text-green-800">Synced</Badge>;
      case "pending": return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "error": return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="notepad-card">
      <CardHeader>
        <CardTitle className="handwritten-text text-green-800 flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          QuickBooks Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium handwritten-text text-blue-700">Connection Status</span>
              {qbStatus.connected ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <p className="text-lg font-bold handwritten-text text-blue-800">
              {qbStatus.connected ? "Connected" : "Not Connected"}
            </p>
            {qbStatus.companyName && (
              <p className="text-xs text-blue-600 handwritten-text">{qbStatus.companyName}</p>
            )}
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium handwritten-text text-green-700">Sync Status</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-lg font-bold handwritten-text text-green-800">
              {qbStatus.totalSynced} Transactions
            </p>
            {qbStatus.lastSync && (
              <p className="text-xs text-green-600 handwritten-text">
                Last sync: {new Date(qbStatus.lastSync).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Connection Actions */}
        {!qbStatus.connected ? (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="handwritten-text text-yellow-800">
              Connect to QuickBooks to automatically sync inventory adjustments, purchases, and sales data with your accounting system.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="handwritten-text text-green-800">
              Successfully connected to QuickBooks. Your inventory data is being automatically synced with your accounting system.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          {!qbStatus.connected ? (
            <Button
              onClick={connectToQuickBooks}
              disabled={isConnecting}
              className="handwritten-text"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Connect to QuickBooks
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={syncTransactions}
              disabled={isSyncing}
              variant="outline"
              className="handwritten-text"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Now ({qbStatus.pendingTransactions} pending)
                </>
              )}
            </Button>
          )}
        </div>

        {/* Pending Transactions */}
        {transactions.length > 0 && (
          <div>
            <h4 className="font-bold handwritten-text text-gray-800 mb-3">Recent Transactions</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <span className="font-medium handwritten-text text-sm">{transaction.description}</span>
                      <p className="text-xs text-gray-600 handwritten-text">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(transaction.status)}
                    <p className="text-sm font-bold handwritten-text text-gray-700 mt-1">
                      ${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Overview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-bold handwritten-text text-gray-800 mb-3">QuickBooks Integration Features:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm handwritten-text">
            <div>• Automatic inventory adjustment sync</div>
            <div>• Purchase order integration</div>
            <div>• Sales data synchronization</div>
            <div>• Cost of goods sold tracking</div>
            <div>• Tax-ready financial reports</div>
            <div>• Real-time profit/loss updates</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}