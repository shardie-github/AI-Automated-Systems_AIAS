/**
 * Multi-Step Tenant Onboarding Wizard
 * Complete setup process for new tenants with company info, plan selection, and configuration
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Settings, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Globe,
  Shield,
  Zap,
  BarChart3,
  Bot,
  Workflow,
  Store,
  Bell,
  Palette,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { SubscriptionPlan, TenantSettings } from '@/types/platform';

interface TenantOnboardingProps {
  onComplete: (tenantData: TenantOnboardingData) => void;
  onCancel: () => void;
}

interface TenantOnboardingData {
  companyInfo: {
    name: string;
    subdomain: string;
    industry: string;
    size: string;
    description: string;
    website: string;
    logo?: string;
  };
  planSelection: {
    planId: string;
    billingCycle: 'monthly' | 'yearly';
    addOns: string[];
  };
  teamSetup: {
    teamMembers: TeamMember[];
    defaultRole: string;
  };
  preferences: {
    timezone: string;
    language: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: NotificationPreferences;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    favicon: string;
    customDomain?: string;
  };
  integrations: {
    selectedIntegrations: string[];
    webhookUrl?: string;
  };
}

interface TeamMember {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  firstName: string;
  lastName: string;
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  webhook: boolean;
  channels: string[];
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams getting started',
    priceMonthly: 29,
    priceYearly: 290,
    features: [
      '5 Workflows',
      '1,000 Executions/month',
      '1GB Storage',
      'Up to 5 Users',
      'Basic Analytics',
      'Email Support'
    ],
    limits: {
      workflows: 5,
      executions: 1000,
      storage: 1,
      users: 5,
      apiCalls: 10000,
      aiProcessing: 100,
      customAgents: 1,
      integrations: 5
    },
    active: true,
    tier: 'starter'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced automation for growing teams',
    priceMonthly: 99,
    priceYearly: 990,
    features: [
      '25 Workflows',
      '10,000 Executions/month',
      '10GB Storage',
      'Unlimited Users',
      'Advanced Analytics',
      'Priority Support',
      'Custom Integrations',
      'AI Agents'
    ],
    limits: {
      workflows: 25,
      executions: 10000,
      storage: 10,
      users: -1,
      apiCalls: 50000,
      aiProcessing: 1000,
      customAgents: 5,
      integrations: 20
    },
    active: true,
    tier: 'professional'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Full-scale automation for large organizations',
    priceMonthly: 299,
    priceYearly: 2990,
    features: [
      'Unlimited Workflows',
      'Unlimited Executions',
      '100GB Storage',
      'Unlimited Users',
      'Advanced Analytics',
      '24/7 Support',
      'Custom Integrations',
      'Unlimited AI Agents',
      'White-label Options',
      'Dedicated Account Manager'
    ],
    limits: {
      workflows: -1,
      executions: -1,
      storage: 100,
      users: -1,
      apiCalls: -1,
      aiProcessing: -1,
      customAgents: -1,
      integrations: -1
    },
    active: true,
    tier: 'enterprise'
  }
];

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education',
  'Manufacturing', 'Retail', 'Real Estate', 'Consulting', 'Non-profit',
  'Media & Entertainment', 'Travel & Hospitality', 'Other'
];

const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees', 
  '51-200 employees',
  '201-1000 employees',
  '1000+ employees'
];

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo',
  'Asia/Shanghai', 'Australia/Sydney', 'UTC'
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' }
];

const AVAILABLE_INTEGRATIONS = [
  { id: 'slack', name: 'Slack', description: 'Team communication and notifications' },
  { id: 'teams', name: 'Microsoft Teams', description: 'Enterprise collaboration' },
  { id: 'discord', name: 'Discord', description: 'Community and gaming communication' },
  { id: 'webhook', name: 'Webhooks', description: 'Custom webhook integrations' },
  { id: 'zapier', name: 'Zapier', description: 'Connect with 5000+ apps' },
  { id: 'salesforce', name: 'Salesforce', description: 'CRM integration' },
  { id: 'hubspot', name: 'HubSpot', description: 'Marketing automation' },
  { id: 'mailchimp', name: 'Mailchimp', description: 'Email marketing' }
];

export const TenantOnboarding: React.FC<TenantOnboardingProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TenantOnboardingData>({
    companyInfo: {
      name: '',
      subdomain: '',
      industry: '',
      size: '',
      description: '',
      website: '',
      logo: ''
    },
    planSelection: {
      planId: 'professional',
      billingCycle: 'monthly',
      addOns: []
    },
    teamSetup: {
      teamMembers: [],
      defaultRole: 'editor'
    },
    preferences: {
      timezone: 'America/New_York',
      language: 'en',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false,
        webhook: false,
        channels: ['general']
      }
    },
    branding: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      logo: '',
      favicon: '',
      customDomain: ''
    },
    integrations: {
      selectedIntegrations: [],
      webhookUrl: ''
    }
  });

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = useCallback((section: keyof TenantOnboardingData, data: Partial<any>) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  }, []);

  const addTeamMember = useCallback(() => {
    updateFormData('teamSetup', {
      teamMembers: [...formData.teamSetup.teamMembers, {
        email: '',
        role: 'editor' as const,
        firstName: '',
        lastName: ''
      }]
    });
  }, [formData.teamSetup.teamMembers, updateFormData]);

  const removeTeamMember = useCallback((index: number) => {
    updateFormData('teamSetup', {
      teamMembers: formData.teamSetup.teamMembers.filter((_, i) => i !== index)
    });
  }, [formData.teamSetup.teamMembers, updateFormData]);

  const updateTeamMember = useCallback((index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = [...formData.teamSetup.teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    updateFormData('teamSetup', { teamMembers: updatedMembers });
  }, [formData.teamSetup.teamMembers, updateFormData]);

  const toggleIntegration = useCallback((integrationId: string) => {
    const current = formData.integrations.selectedIntegrations;
    const updated = current.includes(integrationId)
      ? current.filter(id => id !== integrationId)
      : [...current, integrationId];
    updateFormData('integrations', { selectedIntegrations: updated });
  }, [formData.integrations.selectedIntegrations, updateFormData]);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    onComplete(formData);
  }, [formData, onComplete]);

  const isStepValid = useCallback((step: number) => {
    switch (step) {
      case 1:
        return formData.companyInfo.name && formData.companyInfo.subdomain && formData.companyInfo.industry;
      case 2:
        return formData.planSelection.planId;
      case 3:
        return true; // Team setup is optional
      case 4:
        return formData.preferences.timezone && formData.preferences.language;
      case 5:
        return true; // Branding is optional
      case 6:
        return true; // Integrations are optional
      case 7:
        return true; // Review step
      default:
        return false;
    }
  }, [formData]);

  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === formData.planSelection.planId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AIAS Platform</h1>
          <p className="text-gray-600">Let's set up your workspace in just a few steps</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-8">
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
                  <p className="text-gray-600">Tell us about your organization</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyInfo.name}
                      onChange={(e) => updateFormData('companyInfo', { name: e.target.value })}
                      placeholder="Acme Corporation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subdomain">Subdomain *</Label>
                    <div className="flex">
                      <Input
                        id="subdomain"
                        value={formData.companyInfo.subdomain}
                        onChange={(e) => updateFormData('companyInfo', { subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        placeholder="acme"
                        className="rounded-r-none"
                      />
                      <div className="flex items-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                        .aias.com
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">This will be your workspace URL</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select
                      value={formData.companyInfo.industry}
                      onValueChange={(value) => updateFormData('companyInfo', { industry: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map(industry => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Company Size</Label>
                    <Select
                      value={formData.companyInfo.size}
                      onValueChange={(value) => updateFormData('companyInfo', { size: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      value={formData.companyInfo.description}
                      onChange={(e) => updateFormData('companyInfo', { description: e.target.value })}
                      placeholder="Brief description of your company and what you do..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.companyInfo.website}
                      onChange={(e) => updateFormData('companyInfo', { website: e.target.value })}
                      placeholder="https://www.yourcompany.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo">Company Logo</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              updateFormData('companyInfo', { logo: e.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="flex-1"
                      />
                      {formData.companyInfo.logo && (
                        <img src={formData.companyInfo.logo} alt="Logo preview" className="h-12 w-12 object-contain rounded" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Plan Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
                  <p className="text-gray-600">Select the plan that best fits your needs</p>
                </div>

                <div className="flex justify-center mb-6">
                  <Tabs
                    value={formData.planSelection.billingCycle}
                    onValueChange={(value) => updateFormData('planSelection', { billingCycle: value as 'monthly' | 'yearly' })}
                  >
                    <TabsList>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                      <TabsTrigger value="yearly">Yearly (Save 20%)</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <Card
                      key={plan.id}
                      className={`cursor-pointer transition-all ${
                        formData.planSelection.planId === plan.id
                          ? 'ring-2 ring-blue-500 border-blue-500'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => updateFormData('planSelection', { planId: plan.id })}
                    >
                      <CardHeader className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          {plan.tier === 'starter' && <Zap className="h-6 w-6 text-green-600" />}
                          {plan.tier === 'professional' && <BarChart3 className="h-6 w-6 text-blue-600" />}
                          {plan.tier === 'enterprise' && <Building2 className="h-6 w-6 text-purple-600" />}
                        </div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <p className="text-gray-600 text-sm">{plan.description}</p>
                        <div className="mt-4">
                          <span className="text-3xl font-bold">
                            ${formData.planSelection.billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly}
                          </span>
                          <span className="text-gray-600">
                            /{formData.planSelection.billingCycle === 'yearly' ? 'year' : 'month'}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Team Setup */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Invite Your Team</h2>
                  <p className="text-gray-600">Add team members to your workspace (optional)</p>
                </div>

                <div className="space-y-4">
                  {formData.teamSetup.teamMembers.map((member, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>First Name</Label>
                          <Input
                            value={member.firstName}
                            onChange={(e) => updateTeamMember(index, 'firstName', e.target.value)}
                            placeholder="John"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name</Label>
                          <Input
                            value={member.lastName}
                            onChange={(e) => updateTeamMember(index, 'lastName', e.target.value)}
                            placeholder="Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={member.email}
                            onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                            placeholder="john@company.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select
                            value={member.role}
                            onValueChange={(value) => updateTeamMember(index, 'role', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTeamMember(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addTeamMember}
                    className="w-full"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Preferences */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Settings className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>
                  <p className="text-gray-600">Configure your workspace settings</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={formData.preferences.timezone}
                      onValueChange={(value) => updateFormData('preferences', { timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map(tz => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={formData.preferences.language}
                      onValueChange={(value) => updateFormData('preferences', { language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={formData.preferences.theme}
                      onValueChange={(value) => updateFormData('preferences', { theme: value as 'light' | 'dark' | 'auto' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notification Preferences</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="email-notifications"
                        checked={formData.preferences.notifications.email}
                        onCheckedChange={(checked) => 
                          updateFormData('preferences', {
                            notifications: {
                              ...formData.preferences.notifications,
                              email: checked as boolean
                            }
                          })
                        }
                      />
                      <Label htmlFor="email-notifications">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="push-notifications"
                        checked={formData.preferences.notifications.push}
                        onCheckedChange={(checked) => 
                          updateFormData('preferences', {
                            notifications: {
                              ...formData.preferences.notifications,
                              push: checked as boolean
                            }
                          })
                        }
                      />
                      <Label htmlFor="push-notifications">Push</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sms-notifications"
                        checked={formData.preferences.notifications.sms}
                        onCheckedChange={(checked) => 
                          updateFormData('preferences', {
                            notifications: {
                              ...formData.preferences.notifications,
                              sms: checked as boolean
                            }
                          })
                        }
                      />
                      <Label htmlFor="sms-notifications">SMS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="webhook-notifications"
                        checked={formData.preferences.notifications.webhook}
                        onCheckedChange={(checked) => 
                          updateFormData('preferences', {
                            notifications: {
                              ...formData.preferences.notifications,
                              webhook: checked as boolean
                            }
                          })
                        }
                      />
                      <Label htmlFor="webhook-notifications">Webhook</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Branding */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Palette className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Customize Branding</h2>
                  <p className="text-gray-600">Make it yours with custom colors and branding (optional)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.branding.primaryColor}
                        onChange={(e) => updateFormData('branding', { primaryColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.branding.primaryColor}
                        onChange={(e) => updateFormData('branding', { primaryColor: e.target.value })}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.branding.secondaryColor}
                        onChange={(e) => updateFormData('branding', { secondaryColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.branding.secondaryColor}
                        onChange={(e) => updateFormData('branding', { secondaryColor: e.target.value })}
                        placeholder="#1E40AF"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                    <Input
                      id="customDomain"
                      value={formData.branding.customDomain}
                      onChange={(e) => updateFormData('branding', { customDomain: e.target.value })}
                      placeholder="app.yourcompany.com"
                    />
                    <p className="text-xs text-gray-500">You can configure DNS later</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Brand Preview</h3>
                  <div className="border rounded-lg p-6 bg-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: formData.branding.primaryColor }}
                      >
                        {formData.companyInfo.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold">{formData.companyInfo.name}</h4>
                        <p className="text-sm text-gray-600">Your workspace</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div 
                        className="h-2 rounded"
                        style={{ backgroundColor: formData.branding.primaryColor }}
                      ></div>
                      <div 
                        className="h-2 rounded"
                        style={{ backgroundColor: formData.branding.secondaryColor }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Integrations */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Connect Integrations</h2>
                  <p className="text-gray-600">Set up your favorite tools (optional)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_INTEGRATIONS.map(integration => (
                    <Card
                      key={integration.id}
                      className={`cursor-pointer transition-all ${
                        formData.integrations.selectedIntegrations.includes(integration.id)
                          ? 'ring-2 ring-blue-500 border-blue-500'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => toggleIntegration(integration.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={formData.integrations.selectedIntegrations.includes(integration.id)}
                            readOnly
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{integration.name}</h3>
                            <p className="text-sm text-gray-600">{integration.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {formData.integrations.selectedIntegrations.includes('webhook') && (
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      value={formData.integrations.webhookUrl}
                      onChange={(e) => updateFormData('integrations', { webhookUrl: e.target.value })}
                      placeholder="https://yourcompany.com/webhook"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 7: Review & Complete */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Review & Complete</h2>
                  <p className="text-gray-600">Review your settings before creating your workspace</p>
                </div>

                <div className="space-y-6">
                  {/* Company Info Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Company Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Company:</span> {formData.companyInfo.name}
                        </div>
                        <div>
                          <span className="font-medium">Subdomain:</span> {formData.companyInfo.subdomain}.aias.com
                        </div>
                        <div>
                          <span className="font-medium">Industry:</span> {formData.companyInfo.industry}
                        </div>
                        <div>
                          <span className="font-medium">Size:</span> {formData.companyInfo.size}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Plan Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Selected Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{selectedPlan?.name}</h3>
                          <p className="text-sm text-gray-600">{selectedPlan?.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            ${formData.planSelection.billingCycle === 'yearly' 
                              ? selectedPlan?.priceYearly 
                              : selectedPlan?.priceMonthly}
                          </div>
                          <div className="text-sm text-gray-600">
                            per {formData.planSelection.billingCycle === 'yearly' ? 'year' : 'month'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Team Summary */}
                  {formData.teamSetup.teamMembers.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Team Members ({formData.teamSetup.teamMembers.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {formData.teamSetup.teamMembers.map((member, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span>{member.firstName} {member.lastName} ({member.email})</span>
                              <Badge variant="outline">{member.role}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Integrations Summary */}
                  {formData.integrations.selectedIntegrations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          Integrations ({formData.integrations.selectedIntegrations.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {formData.integrations.selectedIntegrations.map(integrationId => {
                            const integration = AVAILABLE_INTEGRATIONS.find(i => i.id === integrationId);
                            return (
                              <Badge key={integrationId} variant="secondary">
                                {integration?.name}
                              </Badge>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                {currentStep < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    disabled={!isStepValid(currentStep)}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={!isStepValid(currentStep)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Workspace
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TenantOnboarding;