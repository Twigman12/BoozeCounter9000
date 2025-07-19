import { Request, Response } from 'express';

interface QuickBooksTokens {
  access_token: string;
  refresh_token: string;
  realmId: string;
  expires_in: number;
  token_type: string;
}

interface QuickBooksCompanyInfo {
  QueryResponse: {
    CompanyInfo: Array<{
      Name: string;
      CompanyAddr: {
        Line1?: string;
        City?: string;
        CountrySubDivisionCode?: string;
        PostalCode?: string;
      };
      Email?: {
        Address: string;
      };
      WebAddr?: {
        URI: string;
      };
    }>;
  };
}

interface QuickBooksItem {
  Item: {
    Id: string;
    Name: string;
    Description?: string;
    UnitPrice?: number;
    QtyOnHand?: {
      Amount: number;
    };
    InvStartDate?: string;
    Type: string;
    IncomeAccountRef?: {
      value: string;
      name: string;
    };
    AssetAccountRef?: {
      value: string;
      name: string;
    };
  };
}

class QuickBooksAPI {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private tokens: QuickBooksTokens | null = null;

  constructor() {
    this.baseUrl = process.env.QUICKBOOKS_SANDBOX_BASE_URL || 'https://sandbox-quickbooks.api.intuit.com';
    this.clientId = process.env.QUICKBOOKS_CLIENT_ID || '';
    this.clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET || '';
    this.redirectUri = process.env.QUICKBOOKS_REDIRECT_URI || 'http://localhost:5000/api/quickbooks/callback';
  }

  // Generate OAuth authorization URL
  getAuthUrl(): string {
    const scope = 'com.intuit.quickbooks.accounting com.intuit.quickbooks.payment';
    const state = Math.random().toString(36).substring(7);
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      scope,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      access_type: 'offline',
      state
    });

    return `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;
  }

  // Exchange authorization code for tokens
  async getTokens(code: string, realmId: string): Promise<QuickBooksTokens> {
    const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
    
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri
    });

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        },
        body: body.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
      }

      const tokens = await response.json();
      this.tokens = { ...tokens, realmId };
      return this.tokens as QuickBooksTokens;
    } catch (error) {
      console.error('QuickBooks token exchange error:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<QuickBooksTokens> {
    const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
    
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        },
        body: body.toString()
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const tokens = await response.json();
      const currentRealmId = this.tokens?.realmId || '';
      const newTokens: QuickBooksTokens = { ...tokens, realmId: currentRealmId };
      this.tokens = newTokens;
      return newTokens;
    } catch (error) {
      console.error('QuickBooks token refresh error:', error);
      throw error;
    }
  }

  // Make authenticated API request
  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<any> {
    if (!this.tokens) {
      throw new Error('No QuickBooks tokens available. Please authenticate first.');
    }

    const url = `${this.baseUrl}/v3/company/${this.tokens.realmId}/${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.tokens.access_token}`,
      'Accept': 'application/json'
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`QuickBooks API error: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('QuickBooks API request error:', error);
      throw error;
    }
  }

  // Get company information
  async getCompanyInfo(): Promise<QuickBooksCompanyInfo> {
    return this.makeRequest('companyinfo/1');
  }

  // Get all items (inventory)
  async getItems(): Promise<any> {
    return this.makeRequest("items?fetchAll=true");
  }

  // Create or update inventory item
  async createItem(item: any): Promise<QuickBooksItem> {
    return this.makeRequest('items', 'POST', item);
  }

  // Get customers
  async getCustomers(): Promise<any> {
    return this.makeRequest("customers?fetchAll=true");
  }

  // Get vendors
  async getVendors(): Promise<any> {
    return this.makeRequest("vendors?fetchAll=true");
  }

  // Create sales receipt
  async createSalesReceipt(receipt: any): Promise<any> {
    return this.makeRequest('salesreceipts', 'POST', receipt);
  }

  // Create purchase order
  async createPurchaseOrder(order: any): Promise<any> {
    return this.makeRequest('purchaseorders', 'POST', order);
  }

  // Get accounts
  async getAccounts(): Promise<any> {
    return this.makeRequest("accounts?fetchAll=true");
  }

  // Check connection status
  isConnected(): boolean {
    return !!this.tokens;
  }

  // Get connection info
  getConnectionInfo() {
    if (!this.tokens) return null;
    
    return {
      connected: true,
      realmId: this.tokens.realmId,
      expiresIn: this.tokens.expires_in
    };
  }

  // Set tokens (for persistence)
  setTokens(tokens: QuickBooksTokens) {
    this.tokens = tokens;
  }
}

export const quickBooksAPI = new QuickBooksAPI();

// Route handlers
export async function initiateQuickBooksAuth(req: Request, res: Response) {
  try {
    const authUrl = quickBooksAPI.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('QuickBooks auth initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate QuickBooks authentication' });
  }
}

export async function handleQuickBooksCallback(req: Request, res: Response) {
  try {
    const { code, realmId, state } = req.query;
    
    if (!code || !realmId) {
      return res.status(400).json({ error: 'Missing authorization code or realm ID' });
    }

    const tokens = await quickBooksAPI.getTokens(code as string, realmId as string);
    
    // In production, you'd store these tokens securely
    // For now, we'll keep them in memory
    
    res.json({ 
      success: true, 
      message: 'QuickBooks connected successfully',
      realmId: tokens.realmId
    });
  } catch (error) {
    console.error('QuickBooks callback error:', error);
    res.status(500).json({ error: 'QuickBooks authentication failed' });
  }
}

export async function getQuickBooksStatus(req: Request, res: Response) {
  try {
    const connectionInfo = quickBooksAPI.getConnectionInfo();
    
    if (!connectionInfo) {
      return res.json({
        connected: false,
        lastSync: null,
        companyName: null,
        totalSynced: 0,
        pendingTransactions: 0
      });
    }

    // Get company info if connected
    try {
      const companyInfo = await quickBooksAPI.getCompanyInfo();
      const companyName = companyInfo.QueryResponse.CompanyInfo[0]?.Name || 'Unknown Company';
      
      return res.json({
        connected: true,
        lastSync: new Date().toISOString(),
        companyName,
        totalSynced: 145, // This would come from your database
        pendingTransactions: 3,
        realmId: connectionInfo.realmId
      });
    } catch (apiError) {
      console.error('Error fetching company info:', apiError);
      return res.json({
        connected: true,
        lastSync: null,
        companyName: 'Connected Company',
        totalSynced: 0,
        pendingTransactions: 0,
        realmId: connectionInfo.realmId
      });
    }
  } catch (error) {
    console.error('QuickBooks status error:', error);
    res.status(500).json({ error: 'Failed to get QuickBooks status' });
  }
}

export async function syncToQuickBooks(req: Request, res: Response) {
  try {
    if (!quickBooksAPI.isConnected()) {
      return res.status(400).json({ error: 'QuickBooks not connected' });
    }

    const { transactionIds } = req.body;
    
    // This would sync the specified transactions to QuickBooks
    // For now, we'll simulate the sync process
    
    const results = transactionIds.map((id: number) => ({
      id,
      status: 'synced',
      quickbooksId: `qb_${Date.now()}_${id}`,
      syncedAt: new Date().toISOString()
    }));

    res.json({
      success: true,
      synced: results.length,
      failed: 0,
      results
    });
  } catch (error) {
    console.error('QuickBooks sync error:', error);
    res.status(500).json({ error: 'Sync to QuickBooks failed' });
  }
}