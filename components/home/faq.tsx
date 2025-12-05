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

const faqs = [
  {
    category: "Consultancy Services",
    questions: [
      {
        question: "What's the difference between AIAS Consultancy and AIAS Platform?",
        answer: "AIAS Platform is ready-to-use automation software. Our consultancy builds custom platforms from scratch.",
      },
      {
        question: "How long does it take to build a custom AI platform?",
        answer: "Typically 8-16 weeks. We provide weekly demos so you see progress every step of the way.",
      },
      {
        question: "What technologies do you use?",
        answer: "Modern, scalable tech stacks tailored to your needs. We use Next.js, Node.js, Python, and leading AI frameworks.",
      },
      {
        question: "Do you provide ongoing support after launch?",
        answer: "Yes. We offer ongoing support including monitoring, optimization, and feature enhancements.",
      },
      {
        question: "What's included in a custom AI platform build?",
        answer: "Complete development from strategy to deployment: architecture, AI agents, analytics, infrastructure, security, training, and support.",
      },
    ],
  },
  {
    category: "Platform & Pricing",
    questions: [
      {
        question: "How much does a custom AI platform cost?",
        answer: "Custom projects range from $50K-$500K+ depending on scope. Schedule a strategy call for a custom quote.",
      },
      {
        question: "Can I try AIAS Platform before hiring consultancy services?",
        answer: "Absolutely. Start with our 30-day free trial. The platform is CAD $49/month for the Starter plan.",
      },
      {
        question: "Do you offer payment plans for consultancy projects?",
        answer: "Yes. We structure payments across project phases, aligning with deliverables.",
      },
    ],
  },
  {
    category: "Process & Timeline",
    questions: [
      {
        question: "How do you ensure projects stay on time and budget?",
        answer: "We use agile methodology with weekly demos and clear milestones. Scope is locked after discovery.",
      },
      {
        question: "What if I need changes during development?",
        answer: "We accommodate changes through formal change requests. Minor adjustments are usually included.",
      },
      {
        question: "Will my team be trained on the platform?",
        answer: "Yes. Training is included with comprehensive documentation and hands-on sessions.",
      },
    ],
  },
];

export function FAQ() {
  // Flatten FAQs for schema
  const allFAQs = faqs.flatMap((category) =>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our consultancy services and custom AI platform development.
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="text-xl">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
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
