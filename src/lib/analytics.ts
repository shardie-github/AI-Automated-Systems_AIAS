// Comprehensive analytics and business metrics tracking
export interface BusinessMetrics {
  revenue: {
    mrr: number; // Monthly Recurring Revenue
    arr: number; // Annual Recurring Revenue
    total: number;
    growth: number; // Month-over-month growth
  };
  customers: {
    total: number;
    active: number;
    new: number; // This month
    churned: number; // This month
    churnRate: number;
  };
  usage: {
    totalWorkflows: number;
    totalExecutions: number;
    activeUsers: number;
    apiCalls: number;
  };
  conversion: {
    trialToPaid: number; // Percentage
    visitorToTrial: number; // Percentage
    visitorToPaid: number; // Percentage
  };
  engagement: {
    avgSessionDuration: number; // Minutes
    pageViews: number;
    bounceRate: number;
    returnVisitors: number;
  };
}

export interface EventData {
  event: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  revenue?: number;
  currency?: string;
}

export class AnalyticsService {
  private supabase: any;
  private sentry: any;

  constructor(supabase: any, sentry?: any) {
    this.supabase = supabase;
    this.sentry = sentry;
  }

  // Track custom events
  async trackEvent(event: string, properties: Record<string, any> = {}, userId?: string) {
    const eventData: EventData = {
      event,
      properties,
      userId,
      sessionId: this.getSessionId(),
      timestamp: new Date()
    };

    try {
      // Store in database
      await this.supabase
        .from('analytics_events')
        .insert({
          event_name: event,
          properties: eventData.properties,
          user_id: userId,
          session_id: eventData.sessionId,
          timestamp: eventData.timestamp.toISOString()
        });

      // Send to external analytics (if configured)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event, properties);
      }

      // Track in Sentry for debugging
      if (this.sentry) {
        this.sentry.addBreadcrumb({
          message: event,
          category: 'analytics',
          data: properties
        });
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  // Track revenue events
  async trackRevenue(event: string, amount: number, currency: string = 'USD', properties: Record<string, any> = {}) {
    await this.trackEvent(event, {
      ...properties,
      revenue: amount,
      currency
    });
  }

  // Track conversion events
  async trackConversion(funnel: string, step: string, properties: Record<string, any> = {}) {
    await this.trackEvent('conversion', {
      funnel,
      step,
      ...properties
    });
  }

  // Track user engagement
  async trackEngagement(action: string, properties: Record<string, any> = {}) {
    await this.trackEvent('engagement', {
      action,
      ...properties
    });
  }

  // Get business metrics
  async getBusinessMetrics(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<BusinessMetrics> {
    const startDate = this.getPeriodStart(period);
    const endDate = new Date();

    try {
      // Revenue metrics
      const revenueData = await this.getRevenueMetrics(startDate, endDate);
      
      // Customer metrics
      const customerData = await this.getCustomerMetrics(startDate, endDate);
      
      // Usage metrics
      const usageData = await this.getUsageMetrics(startDate, endDate);
      
      // Conversion metrics
      const conversionData = await this.getConversionMetrics(startDate, endDate);
      
      // Engagement metrics
      const engagementData = await this.getEngagementMetrics(startDate, endDate);

      return {
        revenue: revenueData,
        customers: customerData,
        usage: usageData,
        conversion: conversionData,
        engagement: engagementData
      };
    } catch (error) {
      console.error('Failed to get business metrics:', error);
      throw error;
    }
  }

  private async getRevenueMetrics(startDate: Date, endDate: Date) {
    const { data: subscriptions } = await this.supabase
      .from('subscriptions')
      .select('amount, status, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const { data: oneTimePayments } = await this.supabase
      .from('payments')
      .select('amount, created_at')
      .eq('type', 'one_time')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];
    const mrr = activeSubscriptions.reduce((sum, s) => sum + s.amount, 0);
    const total = mrr + (oneTimePayments?.reduce((sum, p) => sum + p.amount, 0) || 0);

    // Calculate growth (simplified)
    const previousPeriod = await this.getRevenueMetrics(
      new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
      startDate
    );
    const growth = previousPeriod.mrr > 0 ? ((mrr - previousPeriod.mrr) / previousPeriod.mrr) * 100 : 0;

    return {
      mrr,
      arr: mrr * 12,
      total,
      growth
    };
  }

  private async getCustomerMetrics(startDate: Date, endDate: Date) {
    const { data: customers } = await this.supabase
      .from('customers')
      .select('created_at, status')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const { data: churnedCustomers } = await this.supabase
      .from('subscriptions')
      .select('customer_id, status')
      .eq('status', 'canceled')
      .gte('updated_at', startDate.toISOString())
      .lte('updated_at', endDate.toISOString());

    const total = customers?.length || 0;
    const active = customers?.filter(c => c.status === 'active').length || 0;
    const newCustomers = customers?.filter(c => 
      new Date(c.created_at) >= startDate
    ).length || 0;
    const churned = churnedCustomers?.length || 0;
    const churnRate = active > 0 ? (churned / active) * 100 : 0;

    return {
      total,
      active,
      new: newCustomers,
      churned,
      churnRate
    };
  }

  private async getUsageMetrics(startDate: Date, endDate: Date) {
    const { data: workflows } = await this.supabase
      .from('workflows')
      .select('id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const { data: executions } = await this.supabase
      .from('workflow_executions')
      .select('id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const { data: apiCalls } = await this.supabase
      .from('api_usage')
      .select('id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const { data: users } = await this.supabase
      .from('user_sessions')
      .select('user_id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    return {
      totalWorkflows: workflows?.length || 0,
      totalExecutions: executions?.length || 0,
      activeUsers: new Set(users?.map(u => u.user_id) || []).size,
      apiCalls: apiCalls?.length || 0
    };
  }

  private async getConversionMetrics(startDate: Date, endDate: Date) {
    const { data: trials } = await this.supabase
      .from('subscriptions')
      .select('id, status')
      .eq('trial', true)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const { data: paidSubscriptions } = await this.supabase
      .from('subscriptions')
      .select('id')
      .eq('status', 'active')
      .eq('trial', false)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const { data: visitors } = await this.supabase
      .from('analytics_events')
      .select('session_id')
      .eq('event_name', 'page_view')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    const trialToPaid = trials?.length > 0 ? 
      (paidSubscriptions?.length / trials.length) * 100 : 0;
    
    const uniqueVisitors = new Set(visitors?.map(v => v.session_id) || []).size;
    const visitorToTrial = uniqueVisitors > 0 ? 
      (trials?.length / uniqueVisitors) * 100 : 0;
    
    const visitorToPaid = uniqueVisitors > 0 ? 
      (paidSubscriptions?.length / uniqueVisitors) * 100 : 0;

    return {
      trialToPaid,
      visitorToTrial,
      visitorToPaid
    };
  }

  private async getEngagementMetrics(startDate: Date, endDate: Date) {
    const { data: sessions } = await this.supabase
      .from('user_sessions')
      .select('duration, page_views, is_bounce')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const { data: returnVisitors } = await this.supabase
      .from('analytics_events')
      .select('user_id')
      .eq('event_name', 'page_view')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    const totalSessions = sessions?.length || 0;
    const avgSessionDuration = totalSessions > 0 ? 
      sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions : 0;
    
    const totalPageViews = sessions?.reduce((sum, s) => sum + (s.page_views || 0), 0) || 0;
    
    const bounceRate = totalSessions > 0 ? 
      (sessions.filter(s => s.is_bounce).length / totalSessions) * 100 : 0;
    
    const uniqueUsers = new Set(returnVisitors?.map(r => r.user_id) || []).size;
    const returnVisitorsCount = returnVisitors?.length || 0;

    return {
      avgSessionDuration: avgSessionDuration / 60, // Convert to minutes
      pageViews: totalPageViews,
      bounceRate,
      returnVisitors: returnVisitorsCount
    };
  }

  private getPeriodStart(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }
}

// Predefined event tracking functions
export const trackPageView = (page: string, title?: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: title || page,
      page_location: window.location.href,
      page_path: page
    });
  }
};

export const trackButtonClick = (buttonName: string, location: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'click', {
      event_category: 'button',
      event_label: buttonName,
      custom_parameter_location: location
    });
  }
};

export const trackFormSubmit = (formName: string, success: boolean) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'form_submit', {
      event_category: 'form',
      event_label: formName,
      value: success ? 1 : 0
    });
  }
};

export const trackPurchase = (transactionId: string, value: number, currency: string = 'USD') => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency
    });
  }
};