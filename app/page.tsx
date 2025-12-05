import dynamic from "next/dynamic";
import { EnhancedHero } from "@/components/home/enhanced-hero";
import { Features } from "@/components/home/features";
import { StatsSection } from "@/components/home/stats-section";
import { TrustBadges } from "@/components/home/trust-badges";
import { ConversionCTA } from "@/components/home/conversion-cta";
import { SettlerShowcase } from "@/components/home/settler-showcase";
import { SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { FAQSchema } from "@/components/seo/structured-data";

// Lazy load below-the-fold components for performance
const Testimonials = dynamic(() => import("@/components/home/testimonials").then(mod => ({ default: mod.Testimonials })), {
  loading: () => <div className="py-16" aria-label="Loading testimonials" />,
});
const ROICalculator = dynamic(() => import("@/components/home/roi-calculator").then(mod => ({ default: mod.ROICalculator })), {
  loading: () => <div className="py-16" aria-label="Loading ROI calculator" />,
});
const CaseStudyPreview = dynamic(() => import("@/components/home/case-study-preview").then(mod => ({ default: mod.CaseStudyPreview })), {
  loading: () => <div className="py-16" aria-label="Loading case studies" />,
});
const FAQ = dynamic(() => import("@/components/home/faq").then(mod => ({ default: mod.FAQ })), {
  loading: () => <div className="py-16" aria-label="Loading FAQ" />,
});

const homepageFAQs = [
  {
    question: "What's the difference between AI Automated Systems consulting and the AIAS Platform?",
    answer: "AI Automated Systems builds custom AI platforms from scratch (like TokPulse and Hardonia Suite). We architect, develop, and deploy complete solutions tailored to your business. The AIAS Platform is our SaaS product for businesses that want ready-made automation tools.",
  },
  {
    question: "How long does it take to build a custom AI platform?",
    answer: "Typical timelines range from 8-16 weeks depending on complexity. We provide weekly demos throughout development so you see progress every step of the way.",
  },
  {
    question: "Do you provide ongoing support after launch?",
    answer: "Yes. We offer ongoing support packages including 24/7 monitoring, performance optimization, feature enhancements, bug fixes, and strategic consulting.",
  },
];

export default function HomePage() {
  return (
    <>
      <SoftwareApplicationSchema />
      <FAQSchema faqs={homepageFAQs} />
      <EnhancedHero />
      <StatsSection />
      <TrustBadges />
      <CaseStudyPreview />
      <SettlerShowcase />
      <ROICalculator />
      <Features />
      <Testimonials />
      <FAQ />
      <ConversionCTA />
    </>
  );
}
