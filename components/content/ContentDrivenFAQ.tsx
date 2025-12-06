"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FadeIn from "@/components/motion/fade-in";
import { FAQSchema } from "@/components/seo/structured-data";
import type { FAQSection } from "@/lib/content/schemas";

interface ContentDrivenFAQProps {
  content: FAQSection;
}

export function ContentDrivenFAQ({ content }: ContentDrivenFAQProps) {
  // Flatten FAQs for schema
  const allFAQs = content.categories.flatMap((category) =>
    category.questions.map((q) => ({
      question: q.question,
      answer: q.answer,
    }))
  );

  return (
    <section className="py-20 bg-muted/30">
      <FAQSchema faqs={allFAQs} />
      <FadeIn>
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            {content.sectionTitle && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {content.sectionTitle}
              </h2>
            )}
            {content.sectionSubtitle && (
              <p className="text-lg text-muted-foreground">
                {content.sectionSubtitle}
              </p>
            )}
          </div>

          <div className="space-y-8">
            {content.categories.map((category, categoryIndex) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="text-xl">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${categoryIndex}-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Still have questions? We're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/demo"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Schedule Strategy Call
              </a>
              <a
                href="mailto:support@aiautomatedsystems.ca"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Email Support
              </a>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
