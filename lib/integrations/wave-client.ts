/**
 * Wave Accounting API Client
 * Handles all Wave API interactions with proper error handling and retries
 */

import { logger } from "@/lib/logging/structured-logger";
import { retryWithBackoff } from "@/lib/utils/retry-enhanced";

export interface WaveConfig {
  businessId: string;
  accessToken: string;
}

export interface WaveInvoice {
  id: string;
  invoiceNumber: string;
  customer: {
    email: string;
    name: string;
  };
  dueDate: string;
  total: number;
  status: string;
}

export interface WaveInvoiceResponse {
  data: {
    business: {
      invoices: {
        edges: Array<{
          node: WaveInvoice;
        }>;
      };
    };
  };
}

export interface WaveRevenueData {
  revenue: number;
  period: string;
}

export class WaveClient {
  private businessId: string;
  private accessToken: string;
  private baseUrl: string = "https://api.waveapps.com";

  constructor(config: WaveConfig) {
    this.businessId = config.businessId;
    this.accessToken = config.accessToken;
  }

  /**
   * Make authenticated request to Wave API with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
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
            let errorMessage = `Wave API error: ${response.status} ${response.statusText}`;
            
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.message) {
                errorMessage = `Wave API error: ${errorData.message}`;
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
            logger.error("Wave API request failed", error, {
              endpoint,
              businessId: this.businessId,
            });
            throw error;
          }
          throw new Error(`Wave API request failed: ${String(error)}`);
        }
      },
      {
        maxAttempts: 3,
        initialDelayMs: 1000,
        onRetry: (attempt, error) => {
          logger.warn("Retrying Wave API request", { attempt, endpoint, error: error.message });
        },
      }
    );
  }

  /**
   * Get invoices using GraphQL
   */
  async getInvoices(options: {
    status?: string;
    limit?: number;
  } = {}): Promise<WaveInvoice[]> {
    const query = `
      query GetInvoices($businessId: ID!, $first: Int) {
        business(id: $businessId) {
          invoices(first: $first, status: ${options.status ? `"${options.status}"` : "ALL"}) {
            edges {
              node {
                id
                invoiceNumber
                customer {
                  email
                  name
                }
                dueDate
                total
                status
              }
            }
          }
        }
      }
    `;

    try {
      const response = await this.request<WaveInvoiceResponse>("/graphql", {
        method: "POST",
        body: JSON.stringify({
          query,
          variables: {
            businessId: this.businessId,
            first: options.limit || 50,
          },
        }),
      });

      return response.data.business.invoices.edges.map((edge) => edge.node);
    } catch (error) {
      logger.error("Failed to get invoices", error instanceof Error ? error : new Error(String(error)), {
        businessId: this.businessId,
      });
      throw error;
    }
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(daysOverdue: number = 7): Promise<WaveInvoice[]> {
    const allInvoices = await this.getInvoices({ status: "SENT" });
    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);

    return allInvoices.filter((invoice) => {
      const dueDate = new Date(invoice.dueDate);
      return dueDate < cutoffDate && invoice.status !== "PAID";
    });
  }

  /**
   * Create invoice
   */
  async createInvoice(invoiceData: {
    customerEmail: string;
    customerName: string;
    items: Array<{ description: string; quantity: number; unitPrice: number }>;
    dueDate?: string;
  }): Promise<WaveInvoice> {
    const mutation = `
      mutation CreateInvoice($input: InvoiceCreateInput!) {
        invoiceCreate(input: $input) {
          didSucceed
          inputErrors {
            code
            message
            path
          }
          invoice {
            id
            invoiceNumber
            customer {
              email
              name
            }
            dueDate
            total
            status
          }
        }
      }
    `;

    try {
      const dueDate = invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const response = await this.request<{
        data: {
          invoiceCreate: {
            didSucceed: boolean;
            inputErrors: unknown[];
            invoice: WaveInvoice;
          };
        };
      }>("/graphql", {
        method: "POST",
        body: JSON.stringify({
          query: mutation,
          variables: {
            input: {
              businessId: this.businessId,
              customer: {
                email: invoiceData.customerEmail,
                name: invoiceData.customerName,
              },
              items: invoiceData.items,
              dueDate,
            },
          },
        }),
      });

      if (!response.data.invoiceCreate.didSucceed) {
        const errors = response.data.invoiceCreate.inputErrors;
        throw new Error(`Failed to create invoice: ${JSON.stringify(errors)}`);
      }

      return response.data.invoiceCreate.invoice;
    } catch (error) {
      logger.error("Failed to create invoice", error instanceof Error ? error : new Error(String(error)), {
        businessId: this.businessId,
        invoiceData,
      });
      throw error;
    }
  }

  /**
   * Get revenue for a period
   */
  async getRevenue(options: {
    startDate: string;
    endDate: string;
  }): Promise<WaveRevenueData> {
    // Wave API for revenue - this is a simplified version
    // Actual implementation may require different endpoint
    try {
      const invoices = await this.getInvoices();
      const startDate = new Date(options.startDate);
      const endDate = new Date(options.endDate);

      const revenue = invoices
        .filter((invoice) => {
          const invoiceDate = new Date(invoice.dueDate);
          return invoiceDate >= startDate && invoiceDate <= endDate && invoice.status === "PAID";
        })
        .reduce((sum, invoice) => sum + invoice.total, 0);

      return {
        revenue,
        period: `${options.startDate} to ${options.endDate}`,
      };
    } catch (error) {
      logger.error("Failed to get revenue", error instanceof Error ? error : new Error(String(error)), {
        businessId: this.businessId,
        options,
      });
      throw error;
    }
  }

  /**
   * Get today's revenue
   */
  async getTodaysRevenue(): Promise<WaveRevenueData> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.getRevenue({
      startDate: today.toISOString(),
      endDate: tomorrow.toISOString(),
    });
  }

  /**
   * Verify connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.getInvoices({ limit: 1 });
      return true;
    } catch {
      return false;
    }
  }
}
