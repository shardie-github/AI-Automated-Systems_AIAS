import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Award, 
  Target, 
  BarChart3,
  ExternalLink,
  Copy,
  CheckCircle,
  Star,
  Gift,
  Handshake
} from 'lucide-react';
import { PARTNERSHIP_TIERS, createReferralLink } from '@/lib/partnerships';

const PartnershipPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [referralCode, setReferralCode] = useState('aias_partner_12345');
  const [copied, setCopied] = useState(false);

  // Mock partner data
  const partnerData = {
    name: 'Tech Solutions Inc.',
    tier: PARTNERSHIP_TIERS[2], // Gold tier
    totalReferrals: 47,
    qualifiedReferrals: 23,
    totalCommission: 12500,
    pendingCommission: 2500,
    joinDate: '2023-06-15',
    status: 'active'
  };

  const recentReferrals = [
    { id: 1, company: 'Acme Corp', status: 'qualified', commission: 500, date: '2024-01-15' },
    { id: 2, company: 'TechStart LLC', status: 'pending', commission: 300, date: '2024-01-14' },
    { id: 3, company: 'Innovation Co', status: 'paid', commission: 750, date: '2024-01-12' },
    { id: 4, company: 'Future Systems', status: 'qualified', commission: 400, date: '2024-01-10' }
  ];

  const copyReferralLink = () => {
    const link = createReferralLink(referralCode);
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'bronze':
        return <Award className="h-5 w-5 text-amber-600" />;
      case 'silver':
        return <Award className="h-5 w-5 text-gray-400" />;
      case 'gold':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'platinum':
        return <Award className="h-5 w-5 text-purple-600" />;
      default:
        return <Award className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Partnership Portal</h1>
              <p className="text-xl text-gray-600 mt-2">
                Welcome back, {partnerData.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Tier</p>
                <div className="flex items-center space-x-2">
                  {getTierIcon(partnerData.tier.id)}
                  <span className="font-semibold text-lg">{partnerData.tier.name}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {partnerData.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnerData.totalReferrals}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified Referrals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnerData.qualifiedReferrals}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((partnerData.qualifiedReferrals / partnerData.totalReferrals) * 100)}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${partnerData.totalCommission.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ${partnerData.pendingCommission.toLocaleString()} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(partnerData.tier.benefits.commission * 100).toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">
                {partnerData.tier.benefits.bonus > 0 && `+$${partnerData.tier.benefits.bonus} bonus per lead`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Referrals</CardTitle>
                  <CardDescription>Your latest referral activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentReferrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{referral.company}</p>
                          <p className="text-sm text-gray-500">{referral.date}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(referral.status)}>
                            {referral.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">${referral.commission}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tier Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Tier Benefits</CardTitle>
                  <CardDescription>Current partnership tier advantages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Commission Rate</p>
                        <p className="text-sm text-gray-500">{(partnerData.tier.benefits.commission * 100).toFixed(0)}% on all qualified referrals</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Gift className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Bonus Per Lead</p>
                        <p className="text-sm text-gray-500">${partnerData.tier.benefits.bonus} bonus for each qualified lead</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Handshake className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Support Level</p>
                        <p className="text-sm text-gray-500">{partnerData.tier.benefits.support}</p>
                      </div>
                    </div>
                    {partnerData.tier.benefits.whiteLabel && (
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">White-Label Access</p>
                          <p className="text-sm text-gray-500">Custom branding and deployment options</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Referral Management</CardTitle>
                <CardDescription>Track and manage your referrals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Referral Link */}
                  <div className="space-y-2">
                    <Label htmlFor="referral-link">Your Referral Link</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="referral-link"
                        value={createReferralLink(referralCode)}
                        readOnly
                        className="flex-1"
                      />
                      <Button onClick={copyReferralLink} variant="outline">
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Share this link to track referrals and earn commissions
                    </p>
                  </div>

                  {/* Referral Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{partnerData.qualifiedReferrals}</p>
                      <p className="text-sm text-gray-500">Qualified</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {partnerData.totalReferrals - partnerData.qualifiedReferrals}
                      </p>
                      <p className="text-sm text-gray-500">Pending</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">${partnerData.totalCommission.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Earned</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Materials</CardTitle>
                  <CardDescription>Download and customize marketing assets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Company Overview PDF</p>
                        <p className="text-sm text-gray-500">Professional company overview</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Product Brochure</p>
                        <p className="text-sm text-gray-500">Detailed product information</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Social Media Kit</p>
                        <p className="text-sm text-gray-500">Ready-to-use social media content</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Co-Marketing Opportunities</CardTitle>
                  <CardDescription>Joint marketing initiatives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Webinar Series</h4>
                      <p className="text-sm text-gray-500 mb-3">
                        Co-host educational webinars about AI automation
                      </p>
                      <Button size="sm">Request Partnership</Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Case Study Collaboration</h4>
                      <p className="text-sm text-gray-500 mb-3">
                        Create joint case studies showcasing success stories
                      </p>
                      <Button size="sm">Get Started</Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Trade Show Presence</h4>
                      <p className="text-sm text-gray-500 mb-3">
                        Joint booth presence at industry events
                      </p>
                      <Button size="sm">Learn More</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Training Resources</CardTitle>
                  <CardDescription>Learn about our products and services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Product Training</p>
                        <p className="text-sm text-gray-500">Comprehensive product knowledge</p>
                      </div>
                      <Button variant="outline" size="sm">Start Course</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Sales Training</p>
                        <p className="text-sm text-gray-500">Effective selling techniques</p>
                      </div>
                      <Button variant="outline" size="sm">Start Course</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Technical Documentation</p>
                        <p className="text-sm text-gray-500">API and integration guides</p>
                      </div>
                      <Button variant="outline" size="sm">View Docs</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support & Contact</CardTitle>
                  <CardDescription>Get help when you need it</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Dedicated Account Manager</h4>
                      <p className="text-sm text-gray-500 mb-2">Sarah Johnson</p>
                      <p className="text-sm text-gray-500 mb-3">sarah.johnson@aias-consultancy.com</p>
                      <Button size="sm">Contact</Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Partner Support Portal</h4>
                      <p className="text-sm text-gray-500 mb-3">
                        24/7 access to support resources and ticketing
                      </p>
                      <Button size="sm">Access Portal</Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Monthly Partner Calls</h4>
                      <p className="text-sm text-gray-500 mb-3">
                        Join our monthly partner strategy calls
                      </p>
                      <Button size="sm">Register</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your partnership account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input id="company-name" defaultValue={partnerData.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input id="contact-email" type="email" defaultValue="contact@techsolutions.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" defaultValue="https://techsolutions.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea 
                      id="description" 
                      defaultValue="Leading technology solutions provider specializing in AI and automation."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry Focus</Label>
                    <Select defaultValue="technology">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PartnershipPortal;