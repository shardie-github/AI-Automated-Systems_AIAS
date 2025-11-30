// Comprehensive billing and monetization system
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limits: {
    workflows: number;
    executions: number;
    storage: number; // in GB
    users: number;
    apiCalls: number;
    support: 'email' | 'priority' | 'dedicated';
  };
  stripePriceId: {
    monthly: string;
    yearly: string;
  };
  popular?: boolean;
  enterprise?: boolean;
}

export interface UsageMetrics {
  workflows: number;
  executions: number;
  storage: number;
  apiCalls: number;
  users: number;
}

export interface BillingInfo {
  customerId: string;
  subscriptionId?: string;
  plan: SubscriptionPlan;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  usage: UsageMetrics;
  nextBillingDate: Date;
  amount: number;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams getting started with AI automation',
    price: { monthly: 29, yearly: 290 },
    features: [
      '5 AI Workflows',
      '1,000 executions/month',
      '1GB storage',
      'Up to 3 team members',
      'Email support',
      'Basic analytics',
      'Standard templates'
    ],
    limits: {
      workflows: 5,
      executions: 1000,
      storage: 1,
      users: 3,
      apiCalls: 1000,
      support: 'email'
    },
    stripePriceId: {
      monthly: process.env.VITE_STRIPE_PRICE_STARTER_MONTHLY || '',
      yearly: process.env.VITE_STRIPE_PRICE_STARTER_YEARLY || ''
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced features for growing businesses',
    price: { monthly: 99, yearly: 990 },
    features: [
      '25 AI Workflows',
      '10,000 executions/month',
      '10GB storage',
      'Up to 10 team members',
      'Priority support',
      'Advanced analytics',
      'Premium templates',
      'API access',
      'Custom integrations',
      'White-label options'
    ],
    limits: {
      workflows: 25,
      executions: 10000,
      storage: 10,
      users: 10,
      apiCalls: 10000,
      support: 'priority'
    },
    stripePriceId: {
      monthly: process.env.VITE_STRIPE_PRICE_PRO_MONTHLY || '',
      yearly: process.env.VITE_STRIPE_PRICE_PRO_YEARLY || ''
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Unlimited power for large organizations',
    price: { monthly: 299, yearly: 2990 },
    features: [
      'Unlimited AI Workflows',
      '100,000 executions/month',
      '100GB storage',
      'Unlimited team members',
      'Dedicated support',
      'Custom analytics',
      'All templates',
      'Full API access',
      'Custom integrations',
      'White-label solutions',
      'On-premise deployment',
      'SLA guarantee',
      'Custom training'
    ],
    limits: {
      workflows: -1, // unlimited
      executions: 100000,
      storage: 100,
      users: -1, // unlimited
      apiCalls: 100000,
      support: 'dedicated'
    },
    stripePriceId: {
      monthly: process.env.VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
      yearly: process.env.VITE_STRIPE_PRICE_ENTERPRISE_YEARLY || ''
    },
    enterprise: true
  }
];

export const ONE_TIME_APPS = [
  {
    id: 'lead-scoring',
    name: 'AI Lead Scoring App',
    description: 'Automatically score and prioritize leads using AI',
    price: 49,
    category: 'Sales',
    features: ['AI-powered scoring', 'CRM integration', 'Custom scoring rules'],
    stripePriceId: process.env.VITE_STRIPE_PRICE_LEAD_SCORING || ''
  },
  {
    id: 'email-sequences',
    name: 'Email Sequence Builder',
    description: 'Create and automate personalized email campaigns',
    price: 79,
    category: 'Marketing',
    features: ['Drag-and-drop builder', 'A/B testing', 'Analytics dashboard'],
    stripePriceId: process.env.VITE_STRIPE_PRICE_EMAIL_SEQUENCES || ''
  },
  {
    id: 'meeting-scheduler',
    name: 'Smart Meeting Scheduler',
    description: 'AI-powered meeting scheduling with calendar integration',
    price: 99,
    category: 'Productivity',
    features: ['Calendar sync', 'Smart suggestions', 'Time zone handling'],
    stripePriceId: process.env.VITE_STRIPE_PRICE_MEETING_SCHEDULER || ''
  },
  {
    id: 'data-migration',
    name: 'Data Migration Tool',
    description: 'Seamlessly migrate data between systems with AI validation',
    price: 149,
    category: 'Data',
    features: ['AI validation', 'Error detection', 'Progress tracking'],
    stripePriceId: process.env.VITE_STRIPE_PRICE_DATA_MIGRATION || ''
  },
  {
    id: 'report-generator',
    name: 'Custom Report Generator',
    description: 'Generate automated reports with AI insights',
    price: 199,
    category: 'Analytics',
    features: ['Custom templates', 'AI insights', 'Scheduled reports'],
    stripePriceId: process.env.VITE_STRIPE_PRICE_REPORT_GENERATOR || ''
  }
];

export const API_SERVICES = [
  {
    id: 'ai-chat',
    name: 'AI Chat API',
    description: 'Integrate AI chat capabilities into your applications',
    pricing: {
      free: { requests: 1000, period: 'month' },
      paid: [
        { name: 'Basic', price: 0.01, requests: 10000, features: ['Standard models', 'Basic support'] },
        { name: 'Pro', price: 0.005, requests: 100000, features: ['Advanced models', 'Priority support'] },
        { name: 'Enterprise', price: 0.002, requests: 1000000, features: ['Custom models', 'Dedicated support'] }
      ]
    }
  },
  {
    id: 'workflow-engine',
    name: 'Workflow Engine API',
    description: 'Execute and manage automation workflows via API',
    pricing: {
      free: { requests: 500, period: 'month' },
      paid: [
        { name: 'Basic', price: 0.05, requests: 5000, features: ['Standard workflows', 'Basic monitoring'] },
        { name: 'Pro', price: 0.03, requests: 50000, features: ['Advanced workflows', 'Real-time monitoring'] },
        { name: 'Enterprise', price: 0.01, requests: 500000, features: ['Custom workflows', 'Dedicated infrastructure'] }
      ]
    }
  }
];

export class BillingService {
  private stripe: any;
  private supabase: any;

  constructor(stripe: any, supabase: any) {
    this.stripe = stripe;
    this.supabase = supabase;
  }

  async createCustomer(email: string, name: string, idempotencyKey?: string) {
    // CFO Mode: Use idempotency key to prevent duplicate customer creation
    const params: Stripe.CustomerCreateParams = {
      email,
      name,
      metadata: {
        source: 'aias'
      }
    };
    
    if (idempotencyKey) {
      // Stripe supports idempotency via Idempotency-Key header
      return await this.stripe.customers.create(params, {
        idempotencyKey,
      });
    }
    
    return await this.stripe.customers.create(params);
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    trialDays: number = 14,
    idempotencyKey?: string
  ) {
    // CFO Mode: Use idempotency key to prevent duplicate subscriptions
    const params: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: trialDays,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    };
    
    if (idempotencyKey) {
      return await this.stripe.subscriptions.create(params, {
        idempotencyKey,
      });
    }
    
    return await this.stripe.subscriptions.create(params);
  }

  async updateSubscription(subscriptionId: string, newPriceId: string) {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    
    return await this.stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations'
    });
  }

  async cancelSubscription(subscriptionId: string, atPeriodEnd: boolean = true) {
    return await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: atPeriodEnd
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: any = {},
    idempotencyKey?: string
  ) {
    // CFO Mode: Use idempotency key to prevent duplicate payment intents
    // CFO Principle: Amount stored as integer (cents) - no floating point
    const amountCents = Math.round(amount * 100); // Ensure integer
    
    const params: Stripe.PaymentIntentCreateParams = {
      amount: amountCents,
      currency,
      metadata: {
        ...metadata,
        source: 'aias'
      }
    };
    
    if (idempotencyKey) {
      return await this.stripe.paymentIntents.create(params, {
        idempotencyKey,
      });
    }
    
    return await this.stripe.paymentIntents.create(params);
  }

  async trackUsage(tenantId: string, metric: string, amount: number = 1) {
    // Track usage for billing purposes
    const { error } = await this.supabase
      .from('usage_metrics')
      .insert({
        tenant_id: tenantId,
        metric_type: metric,
        amount,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to track usage:', error);
    }
  }

  async getUsageMetrics(tenantId: string, period: 'month' | 'year' = 'month') {
    const startDate = new Date();
    if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const { data, error } = await this.supabase
      .from('usage_metrics')
      .select('metric_type, amount')
      .eq('tenant_id', tenantId)
      .gte('timestamp', startDate.toISOString());

    if (error) {
      console.error('Failed to get usage metrics:', error);
      return {};
    }

    // Aggregate metrics
    const metrics: UsageMetrics = {
      workflows: 0,
      executions: 0,
      storage: 0,
      apiCalls: 0,
      users: 0
    };

    data?.forEach((record: any) => {
      if (record.metric_type in metrics) {
        metrics[record.metric_type as keyof UsageMetrics] += record.amount;
      }
    });

    return metrics;
  }

  async checkUsageLimits(tenantId: string, plan: SubscriptionPlan): Promise<{ withinLimits: boolean; exceeded: string[] }> {
    const usage = await this.getUsageMetrics(tenantId);
    const exceeded: string[] = [];

    if (plan.limits.workflows !== -1 && usage.workflows > plan.limits.workflows) {
      exceeded.push('workflows');
    }
    if (plan.limits.executions !== -1 && usage.executions > plan.limits.executions) {
      exceeded.push('executions');
    }
    if (plan.limits.storage !== -1 && usage.storage > plan.limits.storage) {
      exceeded.push('storage');
    }
    if (plan.limits.users !== -1 && usage.users > plan.limits.users) {
      exceeded.push('users');
    }
    if (plan.limits.apiCalls !== -1 && usage.apiCalls > plan.limits.apiCalls) {
      exceeded.push('apiCalls');
    }

    return {
      withinLimits: exceeded.length === 0,
      exceeded
    };
  }
}

export const calculateSavings = (monthlyPrice: number, yearlyPrice: number): number => {
  const monthlyYearlyTotal = monthlyPrice * 12;
  return Math.round(((monthlyYearlyTotal - yearlyPrice) / monthlyYearlyTotal) * 100);
};

export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};