import type { AIASContent, SettlerContent } from "./schemas";

/**
 * Content templates for quick setup
 */

export const heroTemplates = {
  saas: {
    title: "Transform Your Business with AI Automation",
    subtitle: "Save Time, Increase Revenue, Scale Faster",
    description: "Join thousands of businesses using AI to automate workflows and drive growth.",
    badgeText: "Trusted by 2,000+ Companies",
  },
  enterprise: {
    title: "Enterprise-Grade Solutions",
    subtitle: "Built for Scale, Security, and Success",
    description: "Powerful tools designed for large organizations with complex needs.",
    badgeText: "Enterprise Ready",
  },
  startup: {
    title: "Launch Faster, Scale Smarter",
    subtitle: "Everything You Need to Build and Grow",
    description: "Start with our free plan and scale as you grow. No credit card required.",
    badgeText: "Free to Start",
  },
};

export const featureTemplates = {
  saas: [
    {
      title: "Easy Setup",
      description: "Get started in minutes with our intuitive interface.",
      icon: "zap",
      highlight: true,
    },
    {
      title: "Powerful Integrations",
      description: "Connect with 100+ popular tools and services.",
      icon: "sparkles",
    },
    {
      title: "24/7 Support",
      description: "Get help whenever you need it from our expert team.",
      icon: "lock",
    },
  ],
  enterprise: [
    {
      title: "Enterprise Security",
      description: "Bank-grade security with SOC 2 compliance.",
      icon: "shield",
      highlight: true,
    },
    {
      title: "Custom Solutions",
      description: "Tailored implementations for your unique needs.",
      icon: "code",
    },
    {
      title: "Dedicated Support",
      description: "Priority support with dedicated account managers.",
      icon: "users",
    },
  ],
};

export const testimonialTemplates = [
  {
    quote: "This platform has transformed how we work. The time savings alone have been incredible.",
    author: "Sarah Johnson",
    role: "Operations Manager",
    company: "Tech Startup Inc.",
    rating: 5,
  },
  {
    quote: "The best investment we've made this year. ROI was immediate and continues to grow.",
    author: "Michael Chen",
    role: "CEO",
    company: "Growth Co.",
    rating: 5,
  },
];

export const faqTemplates = {
  pricing: [
    {
      question: "What's included in the free plan?",
      answer: "Our free plan includes basic features, up to 100 actions per month, and email support.",
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, you can change your plan at any time. Changes take effect immediately.",
    },
  ],
  features: [
    {
      question: "Do you offer API access?",
      answer: "Yes, we provide comprehensive REST APIs for all plans, with additional features for enterprise customers.",
    },
    {
      question: "What integrations are available?",
      answer: "We support 100+ integrations including popular tools like Slack, Salesforce, and Zapier.",
    },
  ],
};

/**
 * Apply a template to content
 */
export function applyTemplate(
  content: AIASContent | SettlerContent,
  templateType: "saas" | "enterprise" | "startup"
): AIASContent | SettlerContent {
  const template = heroTemplates[templateType];
  
  return {
    ...content,
    hero: {
      ...content.hero,
      title: template.title,
      subtitle: template.subtitle,
      description: template.description,
      badgeText: template.badgeText,
    },
  };
}
