"use client";
import { Card, CardContent } from "@/components/ui/card";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";
import FadeIn from "@/components/motion/fade-in";

const testimonials = [
  {
    quote: "Systems thinking is what sets AIAS apart. They didn't just automate my processes — they analyzed my entire system from multiple perspectives, found root causes, and designed a holistic solution. This is THE skill needed in the AI age, and it made all the difference.",
    author: "Emma Chen",
    role: "E-commerce Store Owner",
    company: "Chen's Boutique, Toronto, Canada",
    flag: "🇨🇦",
  },
  {
    quote: "As an education consultant, I've seen how automation alone fails. AIAS's systems thinking approach — analyzing from process, technology, people, data, systems, AND automation perspectives — revealed solutions I never would have found. This is the critical skill for success.",
    author: "Dr. Michael Rodriguez",
    role: "International Education Consultant",
    company: "Global Education Partners, London, UK",
    flag: "🇬🇧",
  },
  {
    quote: "Systems thinking is what makes you stand out in the job market and succeed in business. AIAS didn't just implement automation — they applied systems thinking to understand our entire operation, find root causes, and create sustainable solutions. This is the future.",
    author: "Sarah Watanabe",
    role: "Operations Director",
    company: "Tech Solutions Inc., Singapore",
    flag: "🇸🇬",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-muted/50">
      <FadeIn>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Systems Thinking Makes the Difference</h2>
          <p className="text-muted-foreground text-lg">
            Systems thinking is THE critical skill for the AI age. It's what makes you stand out in the job market, 
            succeed in business, and achieve optimal outcomes. See how it's transforming businesses worldwide.
          </p>
        </div>
      </FadeIn>
      <StaggerList staggerDelay={0.15}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <StaggerItem key={testimonial.author}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-4xl">⭐</span>
                    <span className="text-2xl">{testimonial.flag}</span>
                  </div>
                  <p className="mb-4 text-muted-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground mt-1">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </div>
      </StaggerList>
      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground mb-2">
          <strong className="text-foreground">Systems thinking is THE skill needed more than ever in the AI age.</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          NPS: 62 • 70% 7-day retention • 20% free-to-paid conversion • Serving 40+ countries
        </p>
      </div>
    </section>
  );
}
