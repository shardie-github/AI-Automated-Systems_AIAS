"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";
import FadeIn from "@/components/motion/fade-in";
import { Play, Star, Quote } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "AIAS Consultancy didn't just integrate TikTok—they built us a complete platform that thinks and optimizes on its own. The custom AI agents they developed have transformed how we manage TikTok campaigns. This is exactly the kind of custom build that showcases their expertise.",
    author: "Marketing Director",
    role: "Leading E-Commerce Brand",
    company: "TokPulse Client",
    flag: "🇨🇦",
    rating: 5,
    hasVideo: true,
    type: "consultancy",
  },
  {
    quote: "AIAS Consultancy built us an entire automation ecosystem, not just integrations. Their custom AI agents understand our business logic and make decisions autonomously. It's like having a team of experts working 24/7. This showcases what AIAS Consultancy can build.",
    author: "Operations Manager",
    role: "Multi-Channel E-Commerce Business",
    company: "Hardonia Suite Client",
    flag: "🇨🇦",
    rating: 5,
    hasVideo: true,
    type: "consultancy",
  },
  {
    quote: "Systems thinking is what sets AIAS apart. They didn't just automate my processes — they analyzed my entire system from multiple perspectives, found root causes, and designed a holistic solution. This is THE skill needed in the AI age, and it made all the difference.",
    author: "Emma Chen",
    role: "E-commerce Store Owner",
    company: "Chen's Boutique, Toronto, Canada",
    flag: "🇨🇦",
    rating: 5,
    hasVideo: false,
    type: "platform",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 via-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]" />
      
      <FadeIn>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 relative z-10"
        >
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
              Trusted Worldwide
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Why Systems Thinking Makes the Difference
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Systems thinking is THE critical skill for the AI age. It's what makes you stand out in the job market, 
            succeed in business, and achieve optimal outcomes. See how it's transforming businesses worldwide.
          </p>
        </motion.div>
      </FadeIn>
      
      <StaggerList staggerDelay={0.15}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          {testimonials.map((testimonial, index) => (
            <StaggerItem key={testimonial.author}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="h-full"
              >
                <Card className="h-full relative overflow-hidden card-hover border-2">
                  {testimonial.type === "consultancy" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="absolute top-4 right-4 z-10"
                    >
                      <span className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-primary to-accent text-white rounded-full shadow-lg">
                        Consultancy Build
                      </span>
                    </motion.div>
                  )}
                  <CardContent className="pt-6">
                    {/* Quote icon */}
                    <div className="mb-4">
                      <Quote className="h-8 w-8 text-primary/30" />
                    </div>
                    
                    {/* Rating */}
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-2xl">{testimonial.flag}</span>
                    </div>

                    {/* Video placeholder if available */}
                    {testimonial.hasVideo && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="mb-6 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 aspect-video flex items-center justify-center border-2 border-primary/30 relative group cursor-pointer overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-shadow"
                          >
                            <Play className="h-8 w-8 text-white ml-1" />
                          </motion.div>
                        </div>
                        <div className="absolute bottom-3 left-3 text-xs font-semibold text-foreground bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border">
                          Video Testimonial
                        </div>
                      </motion.div>
                    )}

                    <p className="mb-6 text-foreground text-base leading-relaxed font-medium relative pl-4 border-l-2 border-primary/30">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="border-t border-border pt-4 space-y-1">
                      <p className="font-bold text-foreground text-base">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </div>
      </StaggerList>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mt-16 relative z-10"
      >
        <div className="inline-block p-6 rounded-2xl bg-card border-2 border-border shadow-lg">
          <p className="text-base md:text-lg font-bold text-foreground mb-3">
            Systems thinking is THE skill needed more than ever in the AI age.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-semibold text-foreground">NPS: 62</span>
            </div>
            <span>•</span>
            <span><strong className="text-foreground">70%</strong> 7-day retention</span>
            <span>•</span>
            <span><strong className="text-foreground">20%</strong> free-to-paid</span>
            <span>•</span>
            <span>Serving <strong className="text-foreground">40+</strong> countries</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
