import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StickyCTA } from "@/components/layout/sticky-cta";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aias-platform.com";

export const metadata: Metadata = {
  title: {
    default: "Custom AI Platform Development | AIAS Consultancy",
    template: "%s | AIAS Platform",
  },
  description: "We build custom AI platforms — not integrations. See TokPulse and Hardonia Suite. From strategy to deployment. Schedule a strategy call.",
  keywords: ["custom AI platforms", "AI development", "AIAS Consultancy", "TokPulse", "Hardonia Suite", "AI automation", "systems thinking", "AI age skills", "job market advantage", "business success", "systems thinking training", "critical thinking skills", "holistic problem solving", "root cause analysis", "multi-perspective thinking", "career differentiation", "systems thinking methodology", "genai content engine", "automated website creation", "ai blog analysis", "website automation", "genai website generator"],
  authors: [{ name: "AIAS Platform Team", url: siteUrl }],
  creator: "AIAS Platform",
  publisher: "AIAS Platform",
  category: "Technology",
  classification: "Business Software",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" },
    { rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon-32x32.png" },
    { rel: "icon", type: "image/png", sizes: "16x16", url: "/favicon-16x16.png" },
  ],
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
      "en-CA": "/",
    },
  },
  openGraph: {
    title: "AIAS Platform — Custom AI Platform Development | Canadian-Built",
    description: "We build custom AI platforms — not integrations. See TokPulse and Hardonia Suite. From strategy to deployment. Schedule a strategy call.",
    type: "website",
    url: siteUrl,
    siteName: "AIAS Platform",
    locale: "en_US",
    alternateLocale: ["en_CA"],
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AIAS Platform — Custom AI Platform Development",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIAS Platform — Custom AI Platform Development",
    description: "We build custom AI platforms — not integrations. See TokPulse and Hardonia Suite. From strategy to deployment.",
    creator: "@aias_platform",
    site: "@aias_platform",
    images: ["/og-image.png"],
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
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
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
        
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AIAS Platform" />
        
        {/* SEO: Enhanced meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="AIAS Platform" />
        
        {/* Service Worker */}
        <script dangerouslySetInnerHTML={{__html:`if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));}`}} />
        
        {/* Structured Data */}
        <OrganizationSchema />
        <WebSiteSchema />
      </head>
      <body className="min-h-dvh antialiased">
        <EnhancedErrorBoundary>
          <TelemetryProvider>
            <ThemeProvider>
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
              <StickyCTA />
              <Toaster />
              <PWARegistration />
              <PerformanceHUD />
              <PerformanceBeacon />
              <WebVitalsTracker />
              <AgentProvider />
              <UTMTracker />
            </ThemeProvider>
          </TelemetryProvider>
        </EnhancedErrorBoundary>
      </body>
    </html>
  );
}
