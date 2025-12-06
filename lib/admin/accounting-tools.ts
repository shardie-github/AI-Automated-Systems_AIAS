/**
 * Admin Accounting Tools
 * 
 * Public module for accounting and planning tools.
 * This module is visible in the repo for developers.
 * Actual financial data is stored in internal/private/financial/ (encrypted).
 */

export interface AccountingTool {
  id: string;
  name: string;
  description: string;
  category: "planning" | "analysis" | "reporting" | "forecasting";
  requiresFinancialAccess: boolean;
}

/**
 * Available accounting tools
 */
export const accountingTools: AccountingTool[] = [
  {
    id: "cost-tracker",
    name: "Cost Tracker",
    description: "Track infrastructure costs across all services",
    category: "analysis",
    requiresFinancialAccess: false,
  },
  {
    id: "budget-planner",
    name: "Budget Planner",
    description: "Plan and manage budgets for different departments",
    category: "planning",
    requiresFinancialAccess: false,
  },
  {
    id: "forecast-generator",
    name: "Forecast Generator",
    description: "Generate financial forecasts based on historical data",
    category: "forecasting",
    requiresFinancialAccess: false,
  },
  {
    id: "financial-reports",
    name: "Financial Reports",
    description: "Generate comprehensive financial reports",
    category: "reporting",
    requiresFinancialAccess: true, // Requires financial admin access
  },
  {
    id: "aias-financials",
    name: "AIAS Financials",
    description: "AIAS-specific financial data and reports",
    category: "reporting",
    requiresFinancialAccess: true, // Requires financial admin access
  },
];

/**
 * Get accounting tool by ID
 */
export function getAccountingTool(id: string): AccountingTool | undefined {
  return accountingTools.find((tool) => tool.id === id);
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: AccountingTool["category"]): AccountingTool[] {
  return accountingTools.filter((tool) => tool.category === category);
}

/**
 * Get tools accessible to user
 */
export function getAccessibleTools(hasFinancialAccess: boolean): AccountingTool[] {
  return accountingTools.filter(
    (tool) => !tool.requiresFinancialAccess || hasFinancialAccess
  );
}

/**
 * Budget planning utilities
 */
export class BudgetPlanner {
  /**
   * Calculate budget allocation
   */
  static calculateAllocation(
    totalBudget: number,
    allocations: Record<string, number>
  ): Record<string, number> {
    const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);
    if (totalAllocated > totalBudget) {
      throw new Error("Total allocations exceed budget");
    }

    return Object.fromEntries(
      Object.entries(allocations).map(([key, value]) => [
        key,
        (value / totalBudget) * 100, // Percentage
      ])
    );
  }

  /**
   * Forecast budget usage
   */
  static forecastUsage(
    currentSpend: number,
    daysElapsed: number,
    totalDays: number
  ): number {
    const dailyAverage = currentSpend / daysElapsed;
    return dailyAverage * totalDays;
  }
}

/**
 * Financial forecasting utilities
 */
export class FinancialForecaster {
  /**
   * Simple linear forecast
   */
  static linearForecast(
    historicalData: number[],
    periods: number
  ): number[] {
    if (historicalData.length < 2) {
      throw new Error("Need at least 2 data points for forecast");
    }

    const n = historicalData.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = historicalData.reduce((sum, val) => sum + val, 0);
    const sumXY = historicalData.reduce(
      (sum, val, index) => sum + (index + 1) * val,
      0
    );
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const forecast: number[] = [];
    for (let i = 1; i <= periods; i++) {
      forecast.push(intercept + slope * (n + i));
    }

    return forecast;
  }

  /**
   * Calculate growth rate
   */
  static calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;

    const first = values[0];
    const last = values[values.length - 1];
    const periods = values.length - 1;

    return ((last / first) ** (1 / periods) - 1) * 100;
  }
}
