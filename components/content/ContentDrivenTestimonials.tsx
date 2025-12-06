"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";
import FadeIn from "@/components/motion/fade-in";
import { Play, Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import type { TestimonialSection } from "@/lib/content/schemas";

interface ContentDrivenTestimonialsProps {
  content: TestimonialSection;
}

export function ContentDrivenTestimonials({ content }: ContentDrivenTestimonialsProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 via-background to-muted/30 relative overflow-hidden">
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
          {content.sectionTitle && (
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              {content.sectionTitle}
            </h2>
          )}
          {content.sectionSubtitle && (
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              {content.sectionSubtitle}
            </p>
          )}
        </motion.div>
      </FadeIn>
      
      <StaggerList staggerDelay={0.15}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          {content.items.map((testimonial, index) => (
            <StaggerItem key={`${testimonial.author}-${index}`}>
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
                    <div className="mb-4">
                      <Quote className="h-8 w-8 text-primary/30" />
                    </div>
                    
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      {testimonial.flag && <span className="text-2xl">{testimonial.flag}</span>}
                    </div>

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
                      {testimonial.role && (
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      )}
                      {testimonial.company && (
                        <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </div>
      </StaggerList>
    </section>
  );
}
