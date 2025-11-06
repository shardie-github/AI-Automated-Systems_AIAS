import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { Testimonials } from "@/components/home/testimonials";
import { CTASection } from "@/components/home/cta-section";
import { SoftwareApplicationSchema } from "@/components/seo/structured-data";

export default function HomePage() {
  return (
    <>
      <SoftwareApplicationSchema />
      <Hero />
      <Features />
      <CTASection />
      <Testimonials />
    </>
  );
}
