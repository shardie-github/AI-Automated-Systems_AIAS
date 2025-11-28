/**
 * Email Templates for AIAS Platform
 * Comprehensive suite covering all stages of the sales funnel
 * Aligned with brand messaging: Systems Thinking + AI
 */

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  stage: 'awareness' | 'consideration' | 'decision' | 'onboarding' | 'retention' | 'reengagement';
  category: string;
  body: string; // HTML body
  textBody?: string; // Plain text fallback
  variables: string[]; // Available template variables
}

export const emailTemplates: EmailTemplate[] = [
  // ============================================
  // TOP OF FUNNEL - AWARENESS STAGE
  // ============================================

  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to AIAS Platform — Systems Thinking + AI',
    stage: 'awareness',
    category: 'welcome',
    variables: ['firstName', 'lastName', 'email'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">Welcome to AIAS Platform, {{firstName}}!</h1>
    <p style="font-size: 18px; color: #666;">Systems Thinking + AI: The Critical Skill for the AI Age</p>
  </div>

  <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0; font-weight: 600; color: #1e40af;">
      🧠 Systems thinking is THE critical skill needed more than ever in the AI age.
    </p>
    <p style="margin: 10px 0 0 0; color: #1e3a8a;">
      It's what makes you stand out in the job market, succeed in business, and achieve optimal outcomes. AI amplifies systems thinking — it doesn't replace it.
    </p>
  </div>

  <p>Hi {{firstName}},</p>

  <p>Thank you for joining AIAS Platform! We're excited to help you unlock the power of <strong>systems thinking combined with AI automation</strong>.</p>

  <h2 style="color: #1e40af; margin-top: 30px;">What Makes AIAS Different?</h2>

  <p>Most automation platforms focus on tasks. We focus on <strong>systems thinking</strong> — analyzing problems from multiple perspectives to find optimal solutions.</p>

  <ul style="line-height: 2;">
    <li><strong>6-Perspective Analysis:</strong> Every challenge analyzed through process, technology, people, data, systems, AND automation</li>
    <li><strong>Root Cause Identification:</strong> Find underlying causes, not symptoms</li>
    <li><strong>Holistic Solution Design:</strong> Design integrated solutions that work together</li>
    <li><strong>AI-Powered Execution:</strong> AI handles execution, systems thinking creates strategy</li>
  </ul>

  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">🇨🇦 Built in Canada, Serving the World</h3>
    <p style="margin-bottom: 0;">PIPEDA compliant • Multi-currency support • Global integrations • Privacy first</p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://aias-platform.com/getting-started" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Get Started Now
    </a>
  </div>

  <p style="margin-top: 40px;">Questions? Just reply to this email — we're here to help!</p>

  <p>Best regards,<br>
  The AIAS Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
  <p style="font-size: 12px; color: #6b7280; text-align: center;">
    AIAS Platform • Built in Canada 🇨🇦 • <a href="https://aias-platform.com" style="color: #2563eb;">aias-platform.com</a>
  </p>
</body>
</html>
    `,
    textBody: `
Welcome to AIAS Platform, {{firstName}}!

Systems Thinking + AI: The Critical Skill for the AI Age

🧠 Systems thinking is THE critical skill needed more than ever in the AI age. It's what makes you stand out in the job market, succeed in business, and achieve optimal outcomes. AI amplifies systems thinking — it doesn't replace it.

Thank you for joining AIAS Platform! We're excited to help you unlock the power of systems thinking combined with AI automation.

What Makes AIAS Different?

Most automation platforms focus on tasks. We focus on systems thinking — analyzing problems from multiple perspectives to find optimal solutions.

• 6-Perspective Analysis: Every challenge analyzed through process, technology, people, data, systems, AND automation
• Root Cause Identification: Find underlying causes, not symptoms
• Holistic Solution Design: Design integrated solutions that work together
• AI-Powered Execution: AI handles execution, systems thinking creates strategy

🇨🇦 Built in Canada, Serving the World
PIPEDA compliant • Multi-currency support • Global integrations • Privacy first

Get Started: https://aias-platform.com/getting-started

Questions? Just reply to this email — we're here to help!

Best regards,
The AIAS Team

---
AIAS Platform • Built in Canada 🇨🇦 • aias-platform.com
    `,
  },

  {
    id: 'systems-thinking-intro',
    name: 'Systems Thinking Introduction',
    subject: 'Why Systems Thinking is THE Critical Skill for the AI Age',
    stage: 'awareness',
    category: 'education',
    variables: ['firstName'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2563eb; font-size: 28px;">Why Systems Thinking Matters, {{firstName}}</h1>

  <p>The AI revolution isn't coming—it's here. But here's what most people miss:</p>

  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0; font-weight: 600; color: #92400e;">
      The more AI advances, the more systems thinking is needed.
    </p>
  </div>

  <h2 style="color: #1e40af; margin-top: 30px;">The AI Paradox</h2>

  <ul style="line-height: 2;">
    <li><strong>AI eliminates routine</strong> → Systems thinking becomes essential</li>
    <li><strong>AI handles data</strong> → Systems thinking interprets meaning</li>
    <li><strong>AI automates tasks</strong> → Systems thinking designs solutions</li>
    <li><strong>AI scales execution</strong> → Systems thinking creates strategy</li>
  </ul>

  <h2 style="color: #1e40af; margin-top: 30px;">What This Means for You</h2>

  <p><strong>Job Market Advantage:</strong> Systems thinking is uniquely human and irreplaceable. Combined with AI, it's your competitive advantage.</p>

  <p><strong>Business Success:</strong> Systems thinking drives sustainable success. It's what separates successful businesses from those that struggle.</p>

  <p><strong>Optimal Outcomes:</strong> Systems thinking reveals solutions that point solutions cannot. It finds leverage points for sustainable change.</p>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">How AIAS Combines Both</h3>
    <p>AIAS Platform doesn't just automate tasks. We apply <strong>systems thinking</strong> to analyze problems from 6 perspectives:</p>
    <ol style="line-height: 2;">
      <li>Process</li>
      <li>Technology</li>
      <li>People</li>
      <li>Data</li>
      <li>Systems</li>
      <li>Automation</li>
    </ol>
    <p style="margin-bottom: 0;">This multi-dimensional analysis reveals optimal solutions that automation alone cannot achieve.</p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://aias-platform.com/systems-thinking" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Learn More About Systems Thinking
    </a>
  </div>

  <p>Ready to see systems thinking in action?</p>

  <p>Best regards,<br>
  The AIAS Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
  <p style="font-size: 12px; color: #6b7280; text-align: center;">
    AIAS Platform • Built in Canada 🇨🇦 • <a href="https://aias-platform.com" style="color: #2563eb;">aias-platform.com</a>
  </p>
</body>
</html>
    `,
  },

  {
    id: 'use-case-showcase',
    name: 'Use Case Showcase',
    subject: '10 Ways AIAS Solves Real Business Problems',
    stage: 'awareness',
    category: 'education',
    variables: ['firstName'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2563eb; font-size: 28px;">Real Problems, Real Solutions, {{firstName}}</h1>

  <p>Every business has repetitive tasks, manual processes, and missed opportunities. Here's how AIAS solves them with <strong>systems thinking + AI automation</strong>:</p>

  <div style="margin: 30px 0;">
    <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 10px;">1. E-Commerce Inventory Management</h2>
    <p><strong>Problem:</strong> Inventory counts get out of sync across platforms. Overselling. Lost sales.</p>
    <p><strong>AIAS Solution:</strong> Automatically sync inventory across all platforms in real-time. Systems thinking ensures the solution works holistically, not just for one platform.</p>
    <p><strong>Outcome:</strong> Zero overselling. 30% increase in sales. 10 hours/week saved.</p>
  </div>

  <div style="margin: 30px 0;">
    <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 10px;">2. Customer Support Automation</h2>
    <p><strong>Problem:</strong> Support team overwhelmed. Slow response times. Low satisfaction.</p>
    <p><strong>AIAS Solution:</strong> AI-powered chatbot handles common questions. Intelligent routing. Systems thinking ensures the solution considers people, process, AND technology.</p>
    <p><strong>Outcome:</strong> 80% reduction in response time. 50% reduction in ticket volume.</p>
  </div>

  <div style="margin: 30px 0;">
    <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 10px;">3. Lead Generation & Qualification</h2>
    <p><strong>Problem:</strong> Leads from multiple sources. Can't track them all. Good opportunities slip through.</p>
    <p><strong>AIAS Solution:</strong> Capture leads from all sources. AI qualification. Systems thinking analyzes the entire lead journey, not just capture.</p>
    <p><strong>Outcome:</strong> 3x increase in conversion rate. Zero leads lost.</p>
  </div>

  <div style="margin: 30px 0;">
    <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 10px;">4. Content Creation & Distribution</h2>
    <p><strong>Problem:</strong> Creating quality content takes time. Distribution is tedious. Inconsistent publishing.</p>
    <p><strong>AIAS Solution:</strong> GenAI Content Engine generates content. Automated distribution. Systems thinking ensures content aligns with brand voice AND business goals.</p>
    <p><strong>Outcome:</strong> 5x increase in content output. Consistent publishing schedule.</p>
  </div>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">And 6 More Use Cases:</h3>
    <ul style="line-height: 2;">
      <li>Financial Reporting & Analysis</li>
      <li>Employee Onboarding Automation</li>
      <li>Data Processing & Transformation</li>
      <li>Social Media Management</li>
      <li>Email Marketing Automation</li>
      <li>Quality Assurance & Testing</li>
    </ul>
    <p style="margin-bottom: 0;"><a href="https://aias-platform.com/use-cases" style="color: #2563eb; font-weight: 600;">See All Use Cases →</a></p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://aias-platform.com/use-cases" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Explore All Use Cases
    </a>
  </div>

  <p>What problem would you like to solve first?</p>

  <p>Best regards,<br>
  The AIAS Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
  <p style="font-size: 12px; color: #6b7280; text-align: center;">
    AIAS Platform • Built in Canada 🇨🇦 • <a href="https://aias-platform.com" style="color: #2563eb;">aias-platform.com</a>
  </p>
</body>
</html>
    `,
  },

  // ============================================
  // MIDDLE OF FUNNEL - CONSIDERATION STAGE
  // ============================================

  {
    id: 'features-overview',
    name: 'Features Overview',
    subject: '6 Ways AIAS Transforms Your Business',
    stage: 'consideration',
    category: 'features',
    variables: ['firstName'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2563eb; font-size: 28px;">6 Ways AIAS Transforms Your Business, {{firstName}}</h1>

  <p>AIAS Platform combines <strong>systems thinking</strong> with <strong>AI automation</strong> to create unstoppable results. Here's what you get:</p>

  <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
    <h2 style="color: #1e40af; font-size: 22px; margin-top: 0;">🧠 1. Systems Thinking Framework</h2>
    <p><strong>THE critical skill for the AI age.</strong> Analyze problems from multiple perspectives:</p>
    <ul style="line-height: 2;">
      <li>6-Perspective Analysis (process, technology, people, data, systems, automation)</li>
      <li>Root Cause Identification</li>
      <li>Holistic Solution Design</li>
      <li>Multi-Dimensional Problem Solving</li>
    </ul>
  </div>

  <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
    <h2 style="color: #1e40af; font-size: 22px; margin-top: 0;">🤖 2. AI Agent Marketplace</h2>
    <p>Create custom AI agents tailored to your business needs. Deploy instantly. Monetize if you want.</p>
    <p><strong>Key Features:</strong></p>
    <ul style="line-height: 2;">
      <li>Visual workflow builder (no coding required)</li>
      <li>Pre-built templates</li>
      <li>One-click deployments</li>
      <li>Real-time analytics</li>
    </ul>
  </div>

  <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
    <h2 style="color: #1e40af; font-size: 22px; margin-top: 0;">📝 3. GenAI Content Engine</h2>
    <p>AI-powered blog and article analysis engine for automated website creation.</p>
    <p><strong>Systems thinking + GenAI</strong> analyzes content from 6 perspectives and generates optimized websites automatically:</p>
    <ul style="line-height: 2;">
      <li>Blog & Article Analysis</li>
      <li>Automated Website Generation</li>
      <li>Multi-Perspective Optimization</li>
      <li>Continuous Improvement</li>
    </ul>
  </div>

  <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
    <h2 style="color: #1e40af; font-size: 22px; margin-top: 0;">🌐 4. Global Integrations (100+)</h2>
    <p>Connect everything. Share data seamlessly. One platform, infinite possibilities.</p>
    <p><strong>Includes:</strong></p>
    <ul style="line-height: 2;">
      <li>E-Commerce: Shopify, WooCommerce, BigCommerce</li>
      <li>Accounting: Wave Accounting, QuickBooks, Stripe CAD</li>
      <li>Banking: RBC, TD, Interac, PayPal CAD</li>
      <li>CRM & Sales: HubSpot, Salesforce, Pipedrive</li>
    </ul>
  </div>

  <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
    <h2 style="color: #1e40af; font-size: 22px; margin-top: 0;">⚡ 5. Automation & Workflows</h2>
    <p>Automate repetitive tasks and save 10+ hours/week.</p>
    <ul style="line-height: 2;">
      <li>Workflow Automation</li>
      <li>Smart Scheduling</li>
      <li>Data Processing</li>
      <li>90% Error Reduction</li>
    </ul>
  </div>

  <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
    <h2 style="color: #1e40af; font-size: 22px; margin-top: 0;">📊 6. Analytics & Insights</h2>
    <p>Real-time analytics on your AI agents and workflows.</p>
    <ul style="line-height: 2;">
      <li>Performance Dashboard</li>
      <li>Usage Analytics</li>
      <li>Custom Reports</li>
      <li>ROI Tracking</li>
    </ul>
  </div>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">🔒 Enterprise Security Built-In</h3>
    <p>PIPEDA Compliant • Data Residency (Canadian primary) • SOC 2 Type II (planned) • AES-256 Encryption</p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://aias-platform.com/features" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Explore All Features
    </a>
  </div>

  <p>Ready to see these features in action?</p>

  <p>Best regards,<br>
  The AIAS Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
  <p style="font-size: 12px; color: #6b7280; text-align: center;">
    AIAS Platform • Built in Canada 🇨🇦 • <a href="https://aias-platform.com" style="color: #2563eb;">aias-platform.com</a>
  </p>
</body>
</html>
    `,
  },

  {
    id: 'canadian-integrations',
    name: 'Canadian Integrations Highlight',
    subject: '20+ Canadian Integrations Built for Your Business',
    stage: 'consideration',
    category: 'features',
    variables: ['firstName'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; font-size: 28px;">🇨🇦 Built in Canada, {{firstName}}</h1>
    <p style="font-size: 18px; color: #666;">20+ Canadian Integrations Ready to Use</p>
  </div>

  <p>We understand Canadian businesses need Canadian solutions. That's why AIAS Platform includes native support for Canadian services:</p>

  <div style="margin: 30px 0;">
    <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 15px;">💳 Payments & Banking</h2>
    <ul style="line-height: 2;">
      <li><strong>Stripe CAD</strong> — Accept Canadian payments</li>
      <li><strong>RBC</strong> — Royal Bank of Canada integration</li>
      <li><strong>TD Bank</strong> — TD Canada Trust integration</li>
      <li><strong>Interac</strong> — Interac e-Transfer support</li>
      <li><strong>PayPal CAD</strong> — Canadian PayPal accounts</li>
    </ul>
  </div>

  <div style="margin: 30px 0;">
    <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 15px;">📊 Accounting & Finance</h2>
    <ul style="line-height: 2;">
      <li><strong>Wave Accounting</strong> — Free Canadian accounting software</li>
      <li><strong>QuickBooks Canada</strong> — Canadian QuickBooks integration</li>
      <li><strong>GST/HST Tracking</strong> — Automatic tax calculation</li>
    </ul>
  </div>

  <div style="margin: 30px 0;">
    <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 15px;">🛒 E-Commerce</h2>
    <ul style="line-height: 2;">
      <li><strong>Shopify</strong> — Canadian e-commerce leader</li>
      <li><strong>WooCommerce</strong> — WordPress e-commerce</li>
      <li><strong>BigCommerce</strong> — Enterprise e-commerce</li>
    </ul>
  </div>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">🔒 Privacy First</h3>
    <p><strong>PIPEDA Compliant:</strong> Canadian privacy law compliance built-in. Your data stays in Canada where possible (primary data centers).</p>
    <p style="margin-bottom: 0;"><strong>Transparent:</strong> We disclose US fallback options. You know where your data lives.</p>
  </div>

  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: #92400e;">💵 Multi-Currency Support</h3>
    <p>Starting at <strong>$49/month (CAD/USD/EUR)</strong>. Prices shown in your local currency. Transparent pricing. No surprises.</p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://aias-platform.com/integrations" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      See All Integrations
    </a>
  </div>

  <p>Plus 100+ global integrations for international businesses. One platform, infinite possibilities.</p>

  <p>Best regards,<br>
  The AIAS Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
  <p style="font-size: 12px; color: #6b7280; text-align: center;">
    AIAS Platform • Built in Canada 🇨🇦 • <a href="https://aias-platform.com" style="color: #2563eb;">aias-platform.com</a>
  </p>
</body>
</html>
    `,
  },

  {
    id: 'social-proof',
    name: 'Social Proof & Testimonials',
    subject: 'See How Businesses Use AIAS to Save 10+ Hours/Week',
    stage: 'consideration',
    category: 'social-proof',
    variables: ['firstName'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2563eb; font-size: 28px;">Real Results, {{firstName}}</h1>

  <p>See how businesses like yours are using <strong>systems thinking + AI automation</strong> to achieve unstoppable results:</p>

  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
    <p style="font-style: italic; margin: 0 0 15px 0;">"AIAS Platform transformed how we handle inventory. We went from manual syncs taking 10 hours/week to zero manual work. Systems thinking helped us see the whole picture, not just one platform."</p>
    <p style="margin: 0; font-weight: 600;">— E-Commerce Business Owner</p>
    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Result: 30% increase in sales, zero overselling</p>
  </div>

  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
    <p style="font-style: italic; margin: 0 0 15px 0;">"The systems thinking approach is what sold me. Most tools automate tasks. AIAS helps us understand WHY we're automating and ensures the solution works holistically."</p>
    <p style="margin: 0; font-weight: 600;">— Small Team Lead</p>
    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Result: 80% reduction in support response time</p>
  </div>

  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
    <p style="font-style: italic; margin: 0 0 15px 0;">"As a solo founder, I don't have time to build everything from scratch. AIAS gives me enterprise capabilities without enterprise costs. The Canadian integrations are a game-changer."</p>
    <p style="margin: 0; font-weight: 600;">— Solo Founder</p>
    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Result: 3x increase in lead conversion rate</p>
  </div>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">By the Numbers</h3>
    <ul style="line-height: 2.5; margin: 0;">
      <li><strong>10+ hours/week saved</strong> on average</li>
      <li><strong>90% reduction</strong> in manual errors</li>
      <li><strong>3x increase</strong> in lead conversion rates</li>
      <li><strong>50% reduction</strong> in support ticket volume</li>
      <li><strong>5x increase</strong> in content output</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://aias-platform.com/case-studies" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Read Case Studies
    </a>
  </div>

  <p>Ready to join them?</p>

  <p>Best regards,<br>
  The AIAS Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
  <p style="font-size: 12px; color: #6b7280; text-align: center;">
    AIAS Platform • Built in Canada 🇨🇦 • <a href="https://aias-platform.com" style="color: #2563eb;">aias-platform.com</a>
  </p>
</body>
</html>
    `,
  },

  // ============================================
  // BOTTOM OF FUNNEL - DECISION STAGE
  // ============================================

  {
    id: 'pricing-comparison',
    name: 'Pricing Comparison',
    subject: 'Simple, Transparent Pricing — Starting at $49/month',
    stage: 'decision',
    category: 'pricing',
    variables: ['firstName'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; font-size: 28px;">Simple, Transparent Pricing, {{firstName}}</h1>
    <p style="font-size: 18px; color: #666;">Multi-currency support • Cancel anytime</p>
  </div>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #2563eb;">
    <div style="text-align: center;">
      <span style="background: #2563eb; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">MOST POPULAR</span>
    </div>
    <h2 style="color: #1e40af; font-size: 24px; text-align: center; margin: 15px 0 5px 0;">Starter</h2>
    <p style="text-align: center; font-size: 32px; font-weight: 700; color: #1e40af; margin: 10px 0;">
      $49<span style="font-size: 18px; color: #666;">/month</span>
    </p>
    <p style="text-align: center; color: #666; margin-bottom: 20px;">For solo operators and small businesses</p>
    <ul style="line-height: 2;">
      <li>✓ 10 AI agents</li>
      <li>✓ Unlimited automations</li>
      <li>✓ 50+ templates</li>
      <li>✓ Canadian integrations (20+)</li>
      <li>✓ Email support (24-48h)</li>
      <li>✓ Analytics dashboard</li>
      <li>✓ Cancel anytime</li>
    </ul>
    <div style="text-align: center; margin-top: 20px;">
      <p style="margin: 0; font-size: 14px; color: #666;">
        <span style="text-decoration: line-through;">$588/year</span>
        <span style="color: #059669; font-weight: 600;"> $490/year (save $98) • Save 20%</span>
      </p>
    </div>
  </div>

  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1e40af; font-size: 24px; text-align: center; margin: 0 0 5px 0;">Free</h2>
    <p style="text-align: center; font-size: 32px; font-weight: 700; color: #1e40af; margin: 10px 0;">
      $0<span style="font-size: 18px; color: #666;">/month</span>
    </p>
    <p style="text-align: center; color: #666; margin-bottom: 20px;">Perfect for trying AIAS Platform</p>
    <ul style="line-height: 2;">
      <li>✓ 3 AI agents</li>
      <li>✓ 100 automations/month</li>
      <li>✓ Basic templates</li>
      <li>✓ Email support</li>
      <li>✓ Community access</li>
    </ul>
  </div>

  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1e40af; font-size: 24px; text-align: center; margin: 0 0 5px 0;">Pro</h2>
    <p style="text-align: center; font-size: 32px; font-weight: 700; color: #1e40af; margin: 10px 0;">
      $149<span style="font-size: 18px; color: #666;">/month</span>
    </p>
    <p style="text-align: center; color: #666; margin-bottom: 20px;">For small teams (2-10 employees)</p>
    <ul style="line-height: 2;">
      <li>✓ 50 AI agents</li>
      <li>✓ Unlimited automations</li>
      <li>✓ All templates</li>
      <li>✓ Advanced integrations</li>
      <li>✓ Priority support (24h)</li>
      <li>✓ Advanced analytics</li>
      <li>✓ Team collaboration</li>
      <li>✓ API access</li>
      <li>✓ White-label options</li>
    </ul>
    <div style="text-align: center; margin-top: 20px;">
      <p style="margin: 0; font-size: 14px; color: #666;">
        <span style="text-decoration: line-through;">$1,788/year</span>
        <span style="color: #059669; font-weight: 600;"> $1,490/year (save $298) • Save 20%</span>
      </p>
    </div>
  </div>

  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: #92400e;">💵 Multi-Currency Support</h3>
    <p style="margin-bottom: 0;">CAD, USD, EUR, GBP, and more. Prices shown in your local currency. Transparent pricing. No surprises.</p>
  </div>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">✅ What's Included</h3>
    <ul style="line-height: 2; margin: 0;">
      <li>14-day free trial (no credit card required)</li>
      <li>Cancel anytime</li>
      <li>PIPEDA compliant privacy</li>
      <li>Canadian data residency (primary)</li>
      <li>24/7 global support</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://aias-platform.com/signup" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Start Free Trial
    </a>
  </div>

  <p>Questions about pricing? Just reply to this email!</p>

  <p>Best regards,<br>
  The AIAS Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
  <p style="font-size: 12px; color: #6b7280; text-align: center;">
    AIAS Platform • Built in Canada 🇨🇦 • <a href="https://aias-platform.com" style="color: #2563eb;">aias-platform.com</a>
  </p>
</body>
</html>
    `,
  },

  {
    id: 'demo-invitation',
    name: 'Demo Invitation',
    subject: 'See AIAS in Action — Book Your Free Demo',
    stage: 'decision',
    category: 'demo',
    variables: ['firstName'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2563eb; font-size: 28px;">See Systems Thinking + AI in Action, {{firstName}}</h1>

  <p>You've learned about AIAS Platform. Now see it in action.</p>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #1e40af;">What You'll See in Your Demo</h2>
    <ul style="line-height: 2;">
      <li><strong>Systems Thinking Framework:</strong> See how we analyze problems from 6 perspectives</li>
      <li><strong>AI Agent Builder:</strong> Watch us create an AI agent in minutes (no coding)</li>
      <li><strong>Workflow Automation:</strong> See automations that save 10+ hours/week</li>
      <li><strong>Canadian Integrations:</strong> See Wave Accounting, Shopify, Stripe CAD in action</li>
      <li><strong>GenAI Content Engine:</strong> Watch automated website generation</li>
      <li><strong>Analytics Dashboard:</strong> See real-time performance metrics</li>
    </ul>
  </div>

  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #92400e;">🎯 Customized to Your Business</h3>
    <p style="margin-bottom: 0;">We'll show you use cases relevant to YOUR business. E-commerce? Support? Lead generation? We'll tailor the demo to what matters to you.</p>
  </div>

  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">⏱️ 30 Minutes</h3>
    <p style="margin-bottom: 0;">That's all it takes. No sales pitch. Just real solutions to real problems.</p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://aias-platform.com/demo" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Book Your Free Demo
    </a>
  </div>

  <p><strong>Can't make a demo?</strong> Start with our <a href="https://aias-platform.com/signup" style="color: #2563eb;">14-day free trial</a>. No credit card required.</p>

  <p>Looking forward to showing you how systems thinking + AI can transform your business!</p>

  <p>Best regards,<br>
  The AIAS Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
  <p style="font-size: 12px; color: #6b7280; text-align: center;">
    AIAS Platform • Built in Canada 🇨🇦 • <a href="https://aias-platform.com" style="color: #2563eb;">aias-platform.com</a>
  </p>
</body>
</html>
    `,
  },

  {
    id: 'trial-reminder',
    name: 'Trial Reminder',
    subject: 'Your 14-Day Free Trial is Waiting — No Credit Card Required',
    stage: 'decision',
    category: 'trial',
    variables: ['firstName'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2563eb; font-size: 28px;">Start Your Free Trial Today, {{firstName}}</h1>

  <p>You've been exploring AIAS Platform. Ready to see what <strong>systems thinking + AI automation</strong> can do for your business?</p>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #1e40af;">What You Get in Your Free Trial</h2>
    <ul style="line-height: 2;">
      <li>✓ Full access to Starter plan features</li>
      <li>✓ 10 AI agents</li>
      <li>✓ Unlimited automations</li>
      <li>✓ 50+ templates</li>
      <li>✓ Canadian integrations</li>
      <li>✓ Analytics dashboard</li>
      <li>✓ Email support</li>
    </ul>
  </div>

  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #92400e;">✅ No Credit Card Required</h3>
    <p style="margin-bottom: 0;">Start your trial right now. No commitment. Cancel anytime.</p>
  </div>

  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">🚀 Get Started in 30 Minutes</h3>
    <p style="margin-bottom: 0;">Our visual workflow builder means you can create your first automation in minutes, not weeks.</p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://aias-platform.com/signup" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Start Free Trial Now
    </a>
  </div>

  <p><strong>Need help getting started?</strong> Check out our <a href="https://aias-platform.com/getting-started" style="color: #2563eb;">Getting Started Guide</a> or reply to this email.</p>

  <p>Best regards,<br>
  The AIAS Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
  <p style="font-size: 12px; color: #6b7280; text-align: center;">
    AIAS Platform • Built in Canada 🇨🇦 • <a href="https://aias-platform.com" style="color: #2563eb;">aias-platform.com</a>
  </p>
</body>
</html>
    `,
  },

  // ============================================
  // POST-PURCHASE - ONBOARDING STAGE
  // ============================================

  {
    id: 'onboarding-welcome',
    name: 'Onboarding Welcome',
    subject: 'Welcome to AIAS Platform — Let\'s Get You Started',
    stage: 'onboarding',
    category: 'onboarding',
    variables: ['firstName', 'planName'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2563eb; font-size: 28px;">Welcome to AIAS Platform, {{firstName}}!</h1>

  <p>Congratulations on starting your journey with <strong>systems thinking + AI automation</strong>!</p>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #1e40af;">Your {{planName}} Plan Includes:</h2>
    <ul style="line-height: 2;">
      <li>✓ AI Agent Builder (visual, no coding)</li>
      <li>✓ Workflow Automation</li>
      <li>✓ Systems Thinking Framework</li>
      <li>✓ Global Integrations (100+)</li>
      <li>✓ Analytics Dashboard</li>
      <li>✓ Email Support</li>
    </ul>
  </div>

  <h2 style="color: #1e40af; margin-top: 30px;">🚀 Quick Start Guide</h2>

  <div style="margin: 20px 0;">
    <h3 style="color: #1e40af; font-size: 18px;">Step 1: Create Your First AI Agent (5 minutes)</h3>
    <p>Start with a template or build from scratch. Our visual builder makes it easy.</p>
    <p><a href="https://aias-platform.com/dashboard/agents/new" style="color: #2563eb;">Create Your First Agent →</a></p>
  </div>

  <div style="margin: 20px 0;">
    <h3 style="color: #1e40af; font-size: 18px;">Step 2: Set Up Your First Integration (10 minutes)</h3>
    <p>Connect your tools. Shopify? Wave Accounting? Stripe? We support 100+ integrations.</p>
    <p><a href="https://aias-platform.com/dashboard/integrations" style="color: #2563eb;">Browse Integrations →</a></p>
  </div>

  <div style="margin: 20px 0;">
    <h3 style="color: #1e40af; font-size: 18px;">Step 3: Build Your First Workflow (15 minutes)</h3>
    <p>Automate a repetitive task. Save time from day one.</p>
    <p><a href="https://aias-platform.com/dashboard/workflows/new" style="color: #2563eb;">Create Workflow →</a></p>
  </div>

  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: #92400e;">💡 Pro Tip: Start with Systems Thinking</h3>
    <p style="margin-bottom: 0;">Before automating, analyze your problem from 6 perspectives: process, technology, people, data, systems, and automation. This ensures your solution works holistically.</p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://aias-platform.com/dashboard" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Go to Dashboard
    </a>
  </div>

  <h2 style="color: #1e40af; margin-top: 30px;">📚 Resources</h2>
  <ul style="line-height: 2;">
    <li><a href="https://aias-platform.com/docs/getting-started" style="color: #2563eb;">Getting Started Guide</a></li>
    <li><a href="https://aias-platform.com/docs/systems-thinking" style="color: #2563eb;">Systems Thinking Framework</a></li>
    <li><a href="https://aias-platform.com/docs/templates" style="color: #2563eb;">Workflow Templates</a></li>
    <li><a href="https://aias-platform.com/docs/integrations" style="color: #2563eb;">Integration Guides</a></li>
  </ul>

  <p><strong>Need help?</strong> Reply to this email or visit our <a href="https://aias-platform.com/help" style="color: #2563eb;">Help Center</a>.</p>

  <p>Let's build something amazing together!</p>

  <p>Best regards,<br>
  The AIAS Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
  <p style="font-size: 12px; color: #6b7280; text-align: center;">
    AIAS Platform • Built in Canada 🇨🇦 • <a href="https://aias-platform.com" style="color: #2563eb;">aias-platform.com</a>
  </p>
</body>
</html>
    `,
  },

  {
    id: 'first-automation-success',
    name: 'First Automation Success',
    subject: '🎉 Congratulations! Your First Automation is Live',
    stage: 'onboarding',
    category: 'onboarding',
    variables: ['firstName', 'automationName'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; font-size: 28px;">🎉 Congratulations, {{firstName}}!</h1>
    <p style="font-size: 18px; color: #666;">Your automation "{{automationName}}" is now live</p>
  </div>

  <p>You've taken the first step toward <strong>systems thinking + AI automation</strong>. Your automation is running and saving you time right now!</p>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #1e40af;">What Happens Next?</h2>
    <p>Your automation will:</p>
    <ul style="line-height: 2;">
      <li>Run automatically based on your triggers</li>
      <li>Process data and execute actions</li>
      <li>Send you notifications (if configured)</li>
      <li>Track performance in your analytics dashboard</li>
    </ul>
  </div>

  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">📊 Monitor Performance</h3>
    <p style="margin-bottom: 0;">Check your <a href="https://aias-platform.com/dashboard/analytics" style="color: #2563eb;">Analytics Dashboard</a> to see how your automation is performing. Track success rates, time saved, and ROI.</p>
  </div>

  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #92400e;">💡 Pro Tip: Apply Systems Thinking</h3>
    <p style="margin-bottom: 0;">Now that your first automation is live, analyze it from 6 perspectives. Is it working holistically? Are there improvements you can make? Systems thinking reveals optimization opportunities.</p>
  </div>

  <h2 style="color: #1e40af; margin-top: 30px;">What's Next?</h2>

  <div style="margin: 20px 0;">
    <h3 style="color: #1e40af; font-size: 18px;">Create More Automations</h3>
    <p>One automation saves time. Multiple automations working together create unstoppable results.</p>
    <p><a href="https://aias-platform.com/dashboard/workflows/new" style="color: #2563eb;">Create Another Automation →</a></p>
  </div>

  <div style="margin: 20px 0;">
    <h3 style="color: #1e40af; font-size: 18px;">Explore Templates</h3>
    <p>Browse our 50+ workflow templates. Find one that fits your business.</p>
    <p><a href="https://aias-platform.com/dashboard/templates" style="color: #2563eb;">Browse Templates →</a></p>
  </div>

  <div style="margin: 20px 0;">
    <h3 style="color: #1e40af; font-size: 18px;">Connect More Integrations</h3>
    <p>Connect all your tools. The more integrations, the more powerful your automations.</p>
    <p><a href="https://aias-platform.com/dashboard/integrations" style="color: #2563eb;">Browse Integrations →</a></p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://aias-platform.com/dashboard" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Go to Dashboard
    </a>
  </div>

  <p>Keep building! Every automation you create brings you closer to optimal outcomes.</p>

  <p>Best regards,<br>
  The AIAS Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
  <p style="font-size: 12px; color: #6b7280; text-align: center;">
    AIAS Platform • Built in Canada 🇨🇦 • <a href="https://aias-platform.com" style="color: #2563eb;">aias-platform.com</a>
  </p>
</body>
</html>
    `,
  },

  // ============================================
  // RETENTION - NURTURING STAGE
  // ============================================

  {
    id: 'advanced-features',
    name: 'Advanced Features Highlight',
    subject: 'Unlock Advanced Features: Systems Thinking + GenAI Content Engine',
    stage: 'retention',
    category: 'features',
    variables: ['firstName'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2563eb; font-size: 28px;">Unlock Advanced Features, {{firstName}}</h1>

  <p>You're already using AIAS Platform. Ready to take it to the next level?</p>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #1e40af;">📝 GenAI Content Engine</h2>
    <p><strong>AI-powered blog and article analysis engine for automated website creation.</strong></p>
    <p>Systems thinking + GenAI analyzes content from 6 perspectives and generates optimized websites automatically:</p>
    <ul style="line-height: 2;">
      <li>Blog & Article Analysis (SEO, UX, structure, conversion, technical, systems)</li>
      <li>Automated Website Generation</li>
      <li>Multi-Perspective Optimization</li>
      <li>Continuous Improvement</li>
    </ul>
    <p style="margin-bottom: 0;"><a href="https://aias-platform.com/dashboard/genai-content" style="color: #2563eb; font-weight: 600;">Try GenAI Content Engine →</a></p>
  </div>

  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #1e40af;">🧠 Advanced Systems Thinking</h2>
    <p>Take your problem-solving to the next level:</p>
    <ul style="line-height: 2;">
      <li>Multi-Dimensional Problem Analysis</li>
      <li>Root Cause Identification Tools</li>
      <li>Holistic Solution Design Framework</li>
      <li>Feedback Loop Analysis</li>
    </ul>
    <p style="margin-bottom: 0;"><a href="https://aias-platform.com/dashboard/systems-thinking" style="color: #2563eb; font-weight: 600;">Explore Advanced Systems Thinking →</a></p>
  </div>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #1e40af;">📊 Advanced Analytics</h2>
    <p>Deep insights into your automations:</p>
    <ul style="line-height: 2;">
      <li>ROI Tracking & Calculation</li>
      <li>Performance Forecasting</li>
      <li>Custom Reports</li>
      <li>Export to CSV/PDF</li>
    </ul>
    <p style="margin-bottom: 0;"><a href="https://aias-platform.com/dashboard/analytics" style="color: #2563eb; font-weight: 600;">View Advanced Analytics →</a></p>
  </div>

  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #92400e;">💡 Pro Tip</h3>
    <p style="margin-bottom: 0;">Combine GenAI Content Engine with your workflow automations. Automatically generate content, then distribute it across platforms. Systems thinking ensures everything works together.</p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://aias-platform.com/dashboard" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Explore Advanced Features
    </a>
  </div>

  <p>Questions? Reply to this email — we're here to help!</p>

  <p>Best regards,<br>
  The AIAS Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
  <p style="font-size: 12px; color: #6b7280; text-align: center;">
    AIAS Platform • Built in Canada 🇨🇦 • <a href="https://aias-platform.com" style="color: #2563eb;">aias-platform.com</a>
  </p>
</body>
</html>
    `,
  },

  {
    id: 'success-tips',
    name: 'Success Tips',
    subject: '5 Tips to Maximize Your AIAS Results',
    stage: 'retention',
    category: 'tips',
    variables: ['firstName'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2563eb; font-size: 28px;">5 Tips to Maximize Your Results, {{firstName}}</h1>

  <p>You're using AIAS Platform. Here's how to get even better results with <strong>systems thinking + AI automation</strong>:</p>

  <div style="margin: 30px 0;">
    <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 10px;">1. Apply Systems Thinking First</h2>
    <p>Before automating, analyze your problem from 6 perspectives: process, technology, people, data, systems, and automation. This ensures your solution works holistically.</p>
    <p><a href="https://aias-platform.com/docs/systems-thinking" style="color: #2563eb;">Learn Systems Thinking Framework →</a></p>
  </div>

  <div style="margin: 30px 0;">
    <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 10px;">2. Start Small, Scale Smart</h2>
    <p>Don't try to automate everything at once. Start with one workflow. Prove value. Then scale. Systems thinking helps you identify the highest-impact opportunities first.</p>
  </div>

  <div style="margin: 30px 0;">
    <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 10px;">3. Connect All Your Tools</h2>
    <p>The more integrations you connect, the more powerful your automations become. Connect Shopify, Wave Accounting, Stripe CAD, and more. One platform, infinite possibilities.</p>
    <p><a href="https://aias-platform.com/dashboard/integrations" style="color: #2563eb;">Browse Integrations →</a></p>
  </div>

  <div style="margin: 30px 0;">
    <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 10px;">4. Monitor & Optimize</h2>
    <p>Check your Analytics Dashboard regularly. Track ROI. Identify optimization opportunities. Systems thinking helps you see the whole picture, not just individual metrics.</p>
    <p><a href="https://aias-platform.com/dashboard/analytics" style="color: #2563eb;">View Analytics →</a></p>
  </div>

  <div style="margin: 30px 0;">
    <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 10px;">5. Use Templates as Starting Points</h2>
    <p>Don't start from scratch. Use our 50+ workflow templates as starting points. Customize them to your needs. Systems thinking helps you adapt templates to your unique situation.</p>
    <p><a href="https://aias-platform.com/dashboard/templates" style="color: #2563eb;">Browse Templates →</a></p>
  </div>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">🎯 Remember</h3>
    <p style="margin-bottom: 0;">Systems thinking + AI automation creates unstoppable results. AI handles execution. Systems thinking ensures optimal direction.</p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://aias-platform.com/dashboard" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Go to Dashboard
    </a>
  </div>

  <p>Keep building! Every optimization brings you closer to optimal outcomes.</p>

  <p>Best regards,<br>
  The AIAS Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
  <p style="font-size: 12px; color: #6b7280; text-align: center;">
    AIAS Platform • Built in Canada 🇨🇦 • <a href="https://aias-platform.com" style="color: #2563eb;">aias-platform.com</a>
  </p>
</body>
</html>
    `,
  },

  // ============================================
  // RE-ENGAGEMENT - WIN-BACK STAGE
  // ============================================

  {
    id: 'win-back-inactive',
    name: 'Win-Back: Inactive User',
    subject: 'We Miss You — Here\'s What\'s New at AIAS',
    stage: 'reengagement',
    category: 'win-back',
    variables: ['firstName'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #2563eb; font-size: 28px;">We Miss You, {{firstName}}</h1>

  <p>It's been a while since you've used AIAS Platform. We've been busy building new features that make <strong>systems thinking + AI automation</strong> even more powerful.</p>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #1e40af;">What's New</h2>
    <ul style="line-height: 2;">
      <li><strong>GenAI Content Engine:</strong> Automated website generation with systems thinking analysis</li>
      <li><strong>Advanced Analytics:</strong> ROI tracking, performance forecasting, custom reports</li>
      <li><strong>New Integrations:</strong> 20+ new integrations including more Canadian services</li>
      <li><strong>Workflow Templates:</strong> 50+ new templates to get you started faster</li>
      <li><strong>Enhanced Systems Thinking Framework:</strong> New tools for multi-dimensional problem analysis</li>
    </ul>
  </div>

  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #92400e;">💡 Remember</h3>
    <p style="margin-bottom: 0;">Systems thinking is THE critical skill for the AI age. Combined with AI automation, it creates unstoppable results. Your account is still active — jump back in anytime!</p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://aias-platform.com/dashboard" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Return to Dashboard
    </a>
  </div>

  <p><strong>Need help getting started again?</strong> Check out our <a href="https://aias-platform.com/getting-started" style="color: #2563eb;">Getting Started Guide</a> or reply to this email.</p>

  <p>We're here to help you achieve optimal outcomes with systems thinking + AI.</p>

  <p>Best regards,<br>
  The AIAS Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
  <p style="font-size: 12px; color: #6b7280; text-align: center;">
    AIAS Platform • Built in Canada 🇨🇦 • <a href="https://aias-platform.com" style="color: #2563eb;">aias-platform.com</a>
  </p>
</body>
</html>
    `,
  },

  {
    id: 'win-back-special-offer',
    name: 'Win-Back: Special Offer',
    subject: 'Special Offer: 20% Off Your Next 3 Months',
    stage: 'reengagement',
    category: 'win-back',
    variables: ['firstName'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; font-size: 28px;">Special Offer Just for You, {{firstName}}</h1>
    <p style="font-size: 18px; color: #666;">20% Off Your Next 3 Months</p>
  </div>

  <p>We noticed you haven't been using AIAS Platform recently. We'd love to have you back!</p>

  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b;">
    <h2 style="margin-top: 0; color: #92400e; text-align: center;">🎁 Special Offer</h2>
    <p style="text-align: center; font-size: 24px; font-weight: 700; color: #92400e; margin: 10px 0;">
      20% Off Your Next 3 Months
    </p>
    <p style="text-align: center; margin-bottom: 0;">Use code: <strong style="font-size: 18px;">WELCOMEBACK20</strong></p>
  </div>

  <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #1e40af;">What You Get</h2>
    <ul style="line-height: 2;">
      <li>✓ All Starter plan features</li>
      <li>✓ 10 AI agents</li>
      <li>✓ Unlimited automations</li>
      <li>✓ 50+ templates</li>
      <li>✓ Canadian integrations</li>
      <li>✓ Analytics dashboard</li>
      <li>✓ Email support</li>
    </ul>
  </div>

  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">🚀 New Features Since You Left</h3>
    <ul style="line-height: 2;">
      <li>GenAI Content Engine</li>
      <li>Advanced Analytics</li>
      <li>20+ New Integrations</li>
      <li>Enhanced Systems Thinking Framework</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://aias-platform.com/dashboard/billing?promo=WELCOMEBACK20" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Claim Your Discount
    </a>
  </div>

  <p style="text-align: center; font-size: 14px; color: #666;">Offer expires in 7 days. Don't miss out!</p>

  <p>Questions? Reply to this email — we're here to help!</p>

  <p>Best regards,<br>
  The AIAS Team</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
  
  <p style="font-size: 12px; color: #6b7280; text-align: center;">
    AIAS Platform • Built in Canada 🇨🇦 • <a href="https://aias-platform.com" style="color: #2563eb;">aias-platform.com</a>
  </p>
</body>
</html>
    `,
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find(t => t.id === id);
}

/**
 * Get templates by stage
 */
export function getTemplatesByStage(stage: EmailTemplate['stage']): EmailTemplate[] {
  return emailTemplates.filter(t => t.stage === stage);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): EmailTemplate[] {
  return emailTemplates.filter(t => t.category === category);
}

/**
 * Replace template variables
 */
export function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}
