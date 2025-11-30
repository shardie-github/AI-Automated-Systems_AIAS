"use client";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CEO, E-Commerce Brand",
    company: "TechRetail Inc.",
    image: "👩‍💼",
    rating: 5,
    text: "AIAS Platform saved us 15+ hours per week. Our team can now focus on strategy instead of manual data entry. The ROI was visible within the first month.",
    location: "Toronto, Canada",
  },
  {
    name: "Michael Rodriguez",
    role: "Operations Director",
    company: "Global Marketing Agency",
    image: "👨‍💼",
    rating: 5,
    text: "The custom AI platform they built for us transformed our workflow. We've seen a 45% increase in efficiency and our clients are thrilled with faster turnaround times.",
    location: "Vancouver, Canada",
  },
  {
    name: "Emily Johnson",
    role: "Founder",
    company: "SaaS Startup",
    image: "👩‍💻",
    rating: 5,
    text: "Best investment we've made. The platform pays for itself in time savings alone. The Canadian data residency was a huge plus for our compliance needs.",
    location: "Montreal, Canada",
  },
  {
    name: "David Kim",
    role: "CTO",
    company: "Enterprise Solutions",
    image: "👨‍💻",
    rating: 5,
    text: "Professional, reliable, and results-driven. They delivered our custom platform on time and exceeded expectations. Ongoing support has been excellent.",
    location: "Calgary, Canada",
  },
  {
    name: "Lisa Thompson",
    role: "VP Operations",
    company: "Healthcare Organization",
    image: "👩‍⚕️",
    rating: 5,
    text: "PIPEDA compliance was critical for us. AIAS delivered a secure, compliant platform that automates our workflows while maintaining the highest security standards.",
    location: "Ottawa, Canada",
  },
];

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/10" aria-label="Customer testimonials">
      <div className="container max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            Loved by Businesses Worldwide
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our clients say about working with AIAS Platform
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              ))}
            </div>
            <span className="text-lg font-bold">4.9/5</span>
            <span className="text-muted-foreground">from 200+ reviews</span>
          </div>
        </motion.div>

        {/* Desktop: Show 3 testimonials */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-8">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <Card className="h-full border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardContent className="pt-6 pb-6 px-6">
                  <Quote className="h-8 w-8 text-primary/30 mb-4" aria-hidden="true" />
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="text-3xl">{testimonial.image}</div>
                    <div>
                      <div className="font-bold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.company}</div>
                      <div className="text-xs text-primary font-medium mt-1">{testimonial.location}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden mb-8">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-primary/50 shadow-lg">
              <CardContent className="pt-6 pb-6 px-6">
                <Quote className="h-8 w-8 text-primary/30 mb-4" aria-hidden="true" />
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  "{testimonials[currentIndex].text}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="text-3xl">{testimonials[currentIndex].image}</div>
                  <div>
                    <div className="font-bold text-sm">{testimonials[currentIndex].name}</div>
                    <div className="text-xs text-muted-foreground">{testimonials[currentIndex].role}</div>
                    <div className="text-xs text-muted-foreground">{testimonials[currentIndex].company}</div>
                    <div className="text-xs text-primary font-medium mt-1">{testimonials[currentIndex].location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Carousel indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm md:text-base">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <span>⭐</span>
              <span>4.9/5 Average Rating</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <span>👥</span>
              <span>200+ Reviews</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <span>✅</span>
              <span>100% Satisfaction</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <span>🚀</span>
              <span>2,000+ Active Users</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
