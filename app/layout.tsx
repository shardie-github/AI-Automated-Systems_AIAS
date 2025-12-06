import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { EnhancedStickyCTA } from "@/components/layout/enhanced-sticky-cta";
import { Toaster } from "@/components/ui/toaster";
import { PWARegistration } from "@/components/pwa-registration";
import { PerformanceHUD } from "@/components/dev/performance-hud";
import { PerformanceBeacon } from "@/components/performance-beacon";
import { WebVitalsTracker } from "@/components/performance/WebVitalsTracker";
import AgentProvider from "@/components/agent/AgentProvider";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/structured-data";
import { EnhancedErrorBoundary } from "@/lib/error-handling/error-boundary-enhanced";
import { TelemetryProvider } from "@/lib/monitoring/telemetry-provider";
import { UTMTracker } from "@/components/analytics/utm-tracker";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { ReactQueryProvider } from "@/lib/data/react-query";
import { env, getOptionalEnv } from "@/lib/env";

const siteUrl = env.app.siteUrl || "https://aiautomatedsystems.ca";

export const metadata: Metadata = {
  title: {
    default: "AI Automated Systems | Custom AI Platform Development | Transform Your Business",
    template: "%s | AI Automated Systems",
  },
  description: "We build custom AI platforms — not integrations. See TokPulse and Hardonia Suite. Save 10+ hours/week. 40% ROI increase. From strategy to deployment. Schedule a free strategy call. No credit card required.",
  keywords: [
    "custom AI platforms",
    "AI development",
    "AI Automated Systems",
    "TokPulse",
    "Hardonia Suite",
    "AI automation",
    "workflow automation",
    "custom AI solutions",
    "AI platform development",
    "business automation",
    "Canadian AI development",
    "enterprise AI",
    "AI agents",
    "no-code AI",
    "systems thinking",
    "AI age skills",
    "job market advantage",
    "business success",
    "ROI increase",
    "time savings",
    "PIPEDA compliant",
    "Canadian data residency",
    "enterprise security",
    "99.9% uptime",
    "free trial",
    "no credit card required",
    "systems thinking training",
    "critical thinking skills",
    "holistic problem solving",
    "root cause analysis",
    "multi-perspective thinking",
    "career differentiation",
    "systems thinking methodology",
    "genai content engine",
    "automated website creation",
    "ai blog analysis",
    "website automation",
    "genai website generator",
  ],
  authors: [{ name: "AI Automated Systems", url: siteUrl }],
  creator: "AI Automated Systems",
  publisher: "AI Automated Systems",
  category: "Technology",
  classification: "Business Software",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    // Note: Additional icon files can be added when available
    // { rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" },
    // { rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon-32x32.png" },
    // { rel: "icon", type: "image/png", sizes: "16x16", url: "/favicon-16x16.png" },
  ],
  manifest: "/manifest.json",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
      "en-CA": "/",
    },
  },
  openGraph: {
    title: "AI Automated Systems — Custom AI Platform Development | Canadian-Built",
    description: "We build custom AI platforms — not integrations. See TokPulse and Hardonia Suite. From strategy to deployment. Schedule a strategy call.",
    type: "website",
    url: siteUrl,
    siteName: "AI Automated Systems",
    locale: "en_US",
    alternateLocale: ["en_CA"],
    images: [
      {
        url: "/placeholder.svg",
        width: 1200,
        height: 630,
        alt: "AI Automated Systems — Custom AI Platform Development",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Automated Systems — Custom AI Platform Development",
    description: "We build custom AI platforms — not integrations. See TokPulse and Hardonia Suite. From strategy to deployment.",
    creator: "@aias_platform",
    site: "@aias_platform",
    images: ["/placeholder.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: getOptionalEnv('NEXT_PUBLIC_GOOGLE_VERIFICATION'),
    yandex: getOptionalEnv('NEXT_PUBLIC_YANDEX_VERIFICATION'),
    yahoo: getOptionalEnv('NEXT_PUBLIC_YAHOO_VERIFICATION'),
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = "en";
  const isRTL = false;

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        {/* Performance: Resource hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://*.supabase.co" />
        <link rel="dns-prefetch" href="https://*.supabase.in" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Prefetch likely next pages */}
        <link rel="prefetch" href="/signup" />
        <link rel="prefetch" href="/pricing" />
        
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI Automated Systems" />
        
        {/* SEO: Enhanced meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="AI Automated Systems" />
        
        {/* Service Worker - Use Next.js Script component for better security */}
        <script
          id="service-worker-registration"
          dangerouslySetInnerHTML={{
            __html: `
              if('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.warn('Service Worker registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
        
        {/* Structured Data */}
        <OrganizationSchema />
        <WebSiteSchema />
      </head>
      <body className="min-h-dvh antialiased">
        <EnhancedErrorBoundary>
          <ReactQueryProvider>
            <TelemetryProvider>
              <ThemeProvider>
                <SmoothScroll>
                {/* Accessibility: Skip to main content link */}
                <a 
                  href="#main" 
                  className="skip-link"
                  aria-label="Skip to main content"
                >
                  Skip to content
                </a>
                <Header />
                <main 
                  id="main" 
                  className="min-h-[calc(100vh-8rem)]"
                  role="main"
                  aria-label="Main content"
                >
                  {children}
                </main>
                <Footer />
                <Analytics />
                <SpeedInsights />
                <EnhancedStickyCTA />
                <Toaster />
                <PWARegistration />
                <PerformanceHUD />
                <PerformanceBeacon />
                <WebVitalsTracker />
                <AgentProvider />
                <UTMTracker />
              </SmoothScroll>
            </ThemeProvider>
          </TelemetryProvider>
          </ReactQueryProvider>
        </EnhancedErrorBoundary>
      </body>
    </html>
  );
}
