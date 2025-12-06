"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";
import FadeIn from "@/components/motion/fade-in";
import { motion } from "framer-motion";
import { Sparkles, Zap, DollarSign, Lock, FileText } from "lucide-react";
import { BentoGrid, BentoGridItem } from "@/components/ui/BentoGrid";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { TextReveal } from "@/components/ui/TextReveal";
import type { FeatureSection } from "@/lib/content/schemas";

// Icon mapping
const iconMap: Record<string, any> = {
  sparkles: Sparkles,
  zap: Zap,
  "dollar-sign": DollarSign,
  lock: Lock,
  "file-text": FileText,
};

interface ContentDrivenFeaturesProps {
  content: FeatureSection;
}

export function ContentDrivenFeatures({ content }: ContentDrivenFeaturesProps) {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <FadeIn>
        <div className="text-center mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
              Powerful Features
            </span>
          </motion.div>
          {content.sectionTitle && (
            <TextReveal
              as="h2"
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
              delay={0.1}
              staggerDelay={0.03}
            >
              {content.sectionTitle}
            </TextReveal>
          )}
          {content.sectionSubtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            >
              {content.sectionSubtitle}
            </motion.p>
          )}
        </div>
      </FadeIn>
      
      <StaggerList>
        <BentoGrid columns={3} className="relative z-10">
          {content.items.map((feature) => {
            const Icon = feature.icon ? iconMap[feature.icon.toLowerCase()] || Sparkles : Sparkles;
            const isWide = feature.highlight;
            const gradient = feature.gradient || "from-blue-500 to-cyan-500";
            
            return (
              <BentoGridItem
                key={feature.title}
                colSpan={isWide ? 2 : 1}
                rowSpan={1}
              >
                <StaggerItem>
                  <SpotlightCard
                    className="h-full"
                    spotlightColor={isWide ? "rgba(6, 182, 212, 0.2)" : "rgba(168, 85, 247, 0.15)"}
                  >
                    <Card className={`h-full border-0 bg-transparent shadow-none ${
                      feature.highlight 
                        ? 'bg-gradient-to-br from-primary/5 to-transparent' 
                        : ''
                    }`}>
                      <CardHeader className="pb-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} mb-4 shadow-lg`}
                        >
                          <Icon className="h-7 w-7 text-white" />
                        </motion.div>
                        <CardTitle className={`text-xl mb-2 ${feature.highlight ? 'text-primary' : ''}`}>
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                      {feature.highlight && (
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                            <Sparkles className="h-4 w-4" />
                            <span>Most Popular</span>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </SpotlightCard>
                </StaggerItem>
              </BentoGridItem>
            );
          })}
        </BentoGrid>
      </StaggerList>
    </section>
  );
}
