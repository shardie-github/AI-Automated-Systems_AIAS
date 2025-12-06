import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, Zap, Shield, Globe, CheckCircle2, ArrowRight, Code, Database, Lock, TrendingUp } from "lucide-react";
import { ServiceSchema } from "@/components/seo/structured-data";
import { Badge } from "@/components/ui/badge";
import { DashboardPreviewWrapper } from "@/components/dashboard/dashboard-preview-wrapper";
import { ContentDrivenHero } from "@/components/content/ContentDrivenHero";
import { loadSettlerContent } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Settler — Enterprise Settlement & Payment Platform | AIAS Partner",
  description: "Settler is a powerful enterprise settlement and payment processing platform. Built by AI Automated Systems, designed for high-volume transactions, compliance, and seamless integrations.",
};

// Icon mapping for features
const iconMap: Record<string, any> = {
  zap: Zap,
  shield: Shield,
  database: Database,
  code: Code,
  lock: Lock,
  "trending-up": TrendingUp,
};

export default async function SettlerPage() {
  // Load content from config (with defaults if file doesn't exist)
  let content;
  try {
    content = await loadSettlerContent();
  } catch (error) {
    // Use server logger for server-side rendering
    const { serverLogger } = await import("@/lib/utils/logger");
    serverLogger.error("Error loading Settler content, using defaults", error as Error);
    content = null;
  }

  // Fallback to defaults if content loading failed
  const features = content?.features?.items || [];
  const useCases = content?.useCases || [];
  return (
    <>
      <ServiceSchema />
      <div className="min-h-screen">
        {/* Hero Section - Use content-driven hero if content is loaded */}
        {content ? (
          <ContentDrivenHero content={content.hero} />
        ) : (
          <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
            <div className="container relative z-10">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-4">
                  <Building2 className="h-4 w-4" />
                  <span>Enterprise Payment Platform</span>
                  <Badge variant="outline" className="ml-2 border-blue-300 dark:border-blue-700">
                    AIAS Partner Product
                  </Badge>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Settler
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Enterprise-grade settlement and payment processing platform. 
                  Built for scale, security, and seamless integration.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <Button size="lg" className="text-lg px-8" asChild>
                    <Link href="/demo">
                      Schedule Demo
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                    <Link href="#features">Explore Features</Link>
                  </Button>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Enterprise Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-500" />
                    <span>🇨🇦 Canadian Built</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-500" />
                    <span>Bank-Grade Security</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Dashboard Preview Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Real-Time Analytics & Insights
              </h2>
              <p className="text-xl text-muted-foreground">
                Get comprehensive visibility into your payment operations with our advanced dashboard.
              </p>
            </div>
            <DashboardPreviewWrapper
              title="Settler Analytics Dashboard"
              description="Transaction monitoring, settlement tracking, and performance metrics"
              variant="settler"
              scrollTargetId="demo-cta"
            />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-background">
          <div className="container">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {content?.features?.sectionTitle || "Built for Enterprise Scale"}
              </h2>
              <p className="text-xl text-muted-foreground">
                {content?.features?.sectionSubtitle || "Everything you need for high-volume payment processing, settlement, and financial operations."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => {
                const Icon = feature.icon ? iconMap[feature.icon.toLowerCase()] || Zap : Zap;
                const color = typeof feature.gradient === 'string' && feature.gradient.startsWith('text-') 
                  ? feature.gradient 
                  : feature.gradient || "text-primary";
                return (
                  <Card key={feature.title} className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                      </div>
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Perfect For
              </h2>
              <p className="text-xl text-muted-foreground">
                Trusted by marketplaces, SaaS platforms, and financial services companies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {useCases.map((useCase) => (
                <Card key={useCase.title} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-xl mb-2">{useCase.title}</CardTitle>
                    <CardDescription className="text-base">{useCase.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Partnership Section */}
        {content?.partnership && (
          <section className="py-20 bg-background">
            <div className="container">
              <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5 border-2">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Building2 className="h-8 w-8 text-primary" />
                    <h2 className="text-3xl md:text-4xl font-bold">
                      {content.partnership.title || "Built by AI Automated Systems"}
                    </h2>
                  </div>
                  <CardDescription className="text-lg">
                    {content.partnership.description || "Settler is a product of AI Automated Systems, leveraging our expertise in enterprise platform development, payment systems, and financial technology."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {content.partnership.whyItems && content.partnership.whyItems.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Why Settler?</h3>
                        <ul className="space-y-2 text-muted-foreground">
                          {content.partnership.whyItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{item.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {content.partnership.synergyItems && content.partnership.synergyItems.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Synergy with AIAS Platform</h3>
                        <ul className="space-y-2 text-muted-foreground">
                          {content.partnership.synergyItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>{item.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {content.partnership.ctas && content.partnership.ctas.length > 0 && (
                    <div className="pt-6 border-t">
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {content.partnership.ctas.map((cta, i) => (
                          cta.visible && (
                            <Button key={i} size="lg" variant={cta.variant as any} asChild>
                              <Link href={cta.href}>
                                {cta.label}
                                {i === 0 && <ArrowRight className="ml-2 h-5 w-5" />}
                              </Link>
                            </Button>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {content?.cta && (
          <section id="demo-cta" className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <div className="container">
              <div className="max-w-3xl mx-auto text-center space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold">
                  {content.cta.title || "Ready to Scale Your Payment Operations?"}
                </h2>
                {content.cta.description && (
                  <p className="text-xl text-blue-100">
                    {content.cta.description}
                  </p>
                )}
                {content.cta.ctas && content.cta.ctas.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    {content.cta.ctas.map((cta, i) => (
                      cta.visible && (
                        <Button key={i} size="lg" variant={cta.variant as any} className="text-lg px-8" asChild>
                          <Link href={cta.href}>
                            {cta.label}
                            {i === 0 && <ArrowRight className="ml-2 h-5 w-5" />}
                          </Link>
                        </Button>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
