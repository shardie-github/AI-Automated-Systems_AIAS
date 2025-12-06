import dynamic from "next/dynamic";
import { EnhancedHero } from "@/components/home/enhanced-hero";
import { ContentDrivenHero } from "@/components/content/ContentDrivenHero";
import { ContentDrivenFeatures } from "@/components/content/ContentDrivenFeatures";
import { ContentDrivenTestimonials } from "@/components/content/ContentDrivenTestimonials";
import { ContentDrivenFAQ } from "@/components/content/ContentDrivenFAQ";
import { Features } from "@/components/home/features";
import { StatsSection } from "@/components/home/stats-section";
import { TrustBadges } from "@/components/home/trust-badges";
import { ConversionCTA } from "@/components/home/conversion-cta";
import { SettlerShowcase } from "@/components/home/settler-showcase";
import { SoftwareApplicationSchema } from "@/components/seo/structured-data";
import { FAQSchema } from "@/components/seo/structured-data";
import { loadAIASContent } from "@/lib/content/loader";

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

export default async function HomePage() {
  // Load content from config (with defaults if file doesn't exist)
  let content;
  try {
    content = await loadAIASContent();
  } catch (error) {
    // Fallback to defaults if loading fails
    console.error("Error loading content, using defaults:", error);
    content = null;
  }

  // Extract FAQs for schema
  const homepageFAQs = content?.faq?.categories.flatMap(cat => 
    cat.questions.map(q => ({ question: q.question, answer: q.answer }))
  ) || [];

  return (
    <>
      <SoftwareApplicationSchema />
      <FAQSchema faqs={homepageFAQs} />
      {content ? (
        <ContentDrivenHero content={content.hero} />
      ) : (
        <EnhancedHero />
      )}
      <StatsSection />
      <TrustBadges />
      <CaseStudyPreview />
      <SettlerShowcase />
      <ROICalculator />
      {content ? (
        <ContentDrivenFeatures content={content.features} />
      ) : (
        <Features />
      )}
      {content ? (
        <ContentDrivenTestimonials content={content.testimonials} />
      ) : (
        <Testimonials />
      )}
      {content ? (
        <ContentDrivenFAQ content={content.faq} />
      ) : (
        <FAQ />
      )}
      <ConversionCTA />
    </>
  );
}
