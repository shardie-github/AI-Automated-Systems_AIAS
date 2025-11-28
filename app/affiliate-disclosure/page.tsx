import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Affiliate Disclosure — AIAS Platform",
  description: "Transparency about affiliate relationships and commissions.",
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="container py-16 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Affiliate Disclosure</h1>
        <p className="text-lg text-muted-foreground">
          Transparency about our affiliate relationships and commissions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Our Affiliate Program Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            AIAS Platform participates in various affiliate marketing programs. This means that when you click 
            on certain links on our website and make a purchase, we may receive a commission at no additional cost to you.
          </p>

          <div>
            <h3 className="font-semibold mb-2">Why We Use Affiliate Links</h3>
            <p className="text-muted-foreground">
              Affiliate commissions help us maintain and improve our content, support our systems thinking research, 
              and keep our platform free for users. We only recommend products and services that align with our mission: 
              promoting systems thinking as THE critical skill for the AI age. Every tool we recommend is evaluated 
              through our systems thinking framework to ensure it helps our community think systemically and succeed.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">How We Mark Affiliate Links</h3>
            <p className="text-muted-foreground">
              Affiliate links are marked with an asterisk (*) or a disclosure badge. We are transparent about 
              our affiliate relationships and never hide the fact that we may earn a commission.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Our Commitment: Systems Thinking First</h3>
            <p className="text-muted-foreground">
              We only promote products and services that genuinely support systems thinking principles. Each recommendation 
              is evaluated through our 6-perspective framework: Does it improve processes? Enhance technology? Support people? 
              Enable better data? Strengthen systems? Enable effective automation? Our recommendations are based on systems 
              thinking value, not commission rates. We're committed to helping you develop the critical skill that makes 
              you stand out in the job market and succeed in business.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Affiliate Programs We Participate In</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Shopify Partners</li>
              <li>Stripe Partners</li>
              <li>Wave Affiliate</li>
              <li>Notion Affiliate</li>
              <li>Zapier Affiliate</li>
              <li>Make (Integromat) Affiliate</li>
            </ul>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Questions?</strong> If you have questions about our affiliate relationships, please contact us 
              at <a href="mailto:hello@aias-platform.com" className="text-primary hover:underline">hello@aias-platform.com</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
