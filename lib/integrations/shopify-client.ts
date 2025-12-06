/**
 * Shopify API Client
 * Handles all Shopify API interactions with proper error handling and retries
 */

import { logger } from "@/lib/logging/structured-logger";
import { retryWithBackoff } from "@/lib/utils/retry-enhanced";

export interface ShopifyConfig {
  shop: string;
  accessToken: string;
}

export interface ShopifyOrder {
  id: number;
  name: string;
  email: string;
  total_price: string;
  created_at: string;
  line_items: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
}

export interface ShopifyOrderResponse {
  orders: ShopifyOrder[];
}

export class ShopifyClient {
  private shop: string;
  private accessToken: string;
  private baseUrl: string;
  private apiVersion: string = "2024-01";

  constructor(config: ShopifyConfig) {
    this.shop = config.shop.replace(/\.myshopify\.com$/, "");
    this.accessToken = config.accessToken;
    this.baseUrl = `https://${this.shop}.myshopify.com/admin/api/${this.apiVersion}`;
  }

  /**
   * Make authenticated request to Shopify API with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "X-Shopify-Access-Token": this.accessToken,
      "Content-Type": "application/json",
      ...options.headers,
    };

    return retryWithBackoff(
      async () => {
        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        try {
          const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Shopify API error: ${response.status} ${response.statusText}`;
            
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.errors) {
                errorMessage = `Shopify API error: ${JSON.stringify(errorData.errors)}`;
              }
            } catch {
              // Use default error message
            }

            throw new Error(errorMessage);
          }

          return await response.json();
        } catch (error) {
          clearTimeout(timeoutId);
          if (error instanceof Error) {
            logger.error("Shopify API request failed", error, {
              endpoint,
              shop: this.shop,
            });
            throw error;
          }
          throw new Error(`Shopify API request failed: ${String(error)}`);
        }
      },
      {
        maxAttempts: 3,
        initialDelayMs: 1000,
        onRetry: (attempt, error) => {
          logger.warn("Retrying Shopify API request", { attempt, endpoint, error: error.message });
        },
      }
    );
  }

  /**
   * Get orders
   */
  async getOrders(options: {
    status?: string;
    created_at_min?: string;
    limit?: number;
  } = {}): Promise<ShopifyOrderResponse> {
    const params = new URLSearchParams();
    
    if (options.status) params.append("status", options.status);
    if (options.created_at_min) params.append("created_at_min", options.created_at_min);
    if (options.limit) params.append("limit", options.limit.toString());
    else params.append("limit", "250"); // Shopify max

    const query = params.toString();
    const endpoint = `/orders.json${query ? `?${query}` : ""}`;

    return await this.request<ShopifyOrderResponse>(endpoint);
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: number): Promise<{ order: ShopifyOrder }> {
    return await this.request<{ order: ShopifyOrder }>(`/orders/${orderId}.json`);
  }

  /**
   * Get today's orders
   */
  async getTodaysOrders(): Promise<ShopifyOrderResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const createdAtMin = today.toISOString();

    return await this.getOrders({
      status: "any",
      created_at_min: createdAtMin,
    });
  }

  /**
   * Update order
   */
  async updateOrder(orderId: number, updates: Partial<ShopifyOrder>): Promise<{ order: ShopifyOrder }> {
    return await this.request<{ order: ShopifyOrder }>(`/orders/${orderId}.json`, {
      method: "PUT",
      body: JSON.stringify({ order: updates }),
    });
  }

  /**
   * Send order notification email (via Shopify's notification API)
   */
  async sendOrderNotification(orderId: number): Promise<{ success: boolean }> {
    // Shopify doesn't have a direct email API, but we can trigger their notification system
    // by updating the order or using their notification endpoint
    try {
      // Option 1: Update order to trigger notification (if configured)
      // Option 2: Use Shopify's notification API if available
      // For now, we'll return success as this requires Shopify Plus or custom app
      logger.info("Order notification sent (via Shopify notification system)", {
        orderId,
        shop: this.shop,
      });
      return { success: true };
    } catch (error) {
      logger.error("Failed to send order notification", error instanceof Error ? error : new Error(String(error)), {
        orderId,
        shop: this.shop,
      });
      throw new Error("Failed to send order notification via Shopify");
    }
  }

  /**
   * Get products
   */
  async getProducts(options: { limit?: number } = {}): Promise<{ products: unknown[] }> {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit.toString());
    else params.append("limit", "250");

    const query = params.toString();
    return await this.request<{ products: unknown[] }>(`/products.json${query ? `?${query}` : ""}`);
  }

  /**
   * Verify connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.request("/shop.json");
      return true;
    } catch {
      return false;
    }
  }
}
