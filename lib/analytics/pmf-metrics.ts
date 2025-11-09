// Product-Market Fit Metrics Dashboard
// Tracks activation rate, retention, NPS, and other PMF indicators

export interface PMFMetrics {
  activationRate: number; // % of signups who create first workflow
  sevenDayRetention: number; // % of users active after 7 days
  thirtyDayRetention: number; // % of users active after 30 days
  nps: number; // Net Promoter Score (-100 to 100)
  timeToActivation: number; // Average hours from signup to first workflow
  workflowsPerUser: number; // Average workflows created per user
  monthlyActiveUsers: number;
  weeklyActiveUsers: number;
}

export interface PMFThresholds {
  activationRate: { good: number; great: number };
  retention: { good: number; great: number };
  nps: { good: number; great: number };
}

export const pmfThresholds: PMFThresholds = {
  activationRate: {
    good: 40, // Industry average
    great: 60, // Target
  },
  retention: {
    good: 50, // Industry average
    great: 70, // Target
  },
  nps: {
    good: 30,
    great: 50,
  },
};

export class PMFTracker {
  private static instance: PMFTracker;
  private metrics: PMFMetrics = {
    activationRate: 0,
    sevenDayRetention: 0,
    thirtyDayRetention: 0,
    nps: 0,
    timeToActivation: 0,
    workflowsPerUser: 0,
    monthlyActiveUsers: 0,
    weeklyActiveUsers: 0,
  };

  static getInstance(): PMFTracker {
    if (!PMFTracker.instance) {
      PMFTracker.instance = new PMFTracker();
    }
    return PMFTracker.instance;
  }

  async calculateMetrics(): Promise<PMFMetrics> {
    // Try to fetch from database first
    try {
      const { databasePMFTracker } = await import("./database-integration");
      const dbMetrics = await databasePMFTracker.getMetricsFromDatabase();
      
      // If database has data, use it
      if (dbMetrics.monthlyActiveUsers > 0) {
        this.metrics = dbMetrics;
        return dbMetrics;
      }
    } catch (error) {
      console.log("Using default metrics (database not connected)");
    }
    
    // Fallback to default/mock data
    return {
      activationRate: 45, // Example: 45% activation rate
      sevenDayRetention: 65, // Example: 65% retention
      thirtyDayRetention: 55,
      nps: 35,
      timeToActivation: 2.5, // hours
      workflowsPerUser: 3.2,
      monthlyActiveUsers: 1250,
      weeklyActiveUsers: 850,
    };
  }

  getPMFScore(): {
    score: number;
    status: "poor" | "good" | "great";
    breakdown: {
      activation: { score: number; status: string };
      retention: { score: number; status: string };
      nps: { score: number; status: string };
    };
  } {
    const metrics = this.metrics;
    
    const activationStatus = metrics.activationRate >= pmfThresholds.activationRate.great 
      ? "great" 
      : metrics.activationRate >= pmfThresholds.activationRate.good 
      ? "good" 
      : "poor";
    
    const retentionStatus = metrics.sevenDayRetention >= pmfThresholds.retention.great 
      ? "great" 
      : metrics.sevenDayRetention >= pmfThresholds.retention.good 
      ? "good" 
      : "poor";
    
    const npsStatus = metrics.nps >= pmfThresholds.nps.great 
      ? "great" 
      : metrics.nps >= pmfThresholds.nps.good 
      ? "good" 
      : "poor";

    const overallScore = (
      (metrics.activationRate / 100) * 0.4 +
      (metrics.sevenDayRetention / 100) * 0.4 +
      ((metrics.nps + 100) / 200) * 0.2
    ) * 100;

    const overallStatus = overallScore >= 70 ? "great" : overallScore >= 50 ? "good" : "poor";

    return {
      score: Math.round(overallScore),
      status: overallStatus,
      breakdown: {
        activation: {
          score: metrics.activationRate,
          status: activationStatus,
        },
        retention: {
          score: metrics.sevenDayRetention,
          status: retentionStatus,
        },
        nps: {
          score: metrics.nps,
          status: npsStatus,
        },
      },
    };
  }
}

export const pmfTracker = PMFTracker.getInstance();
