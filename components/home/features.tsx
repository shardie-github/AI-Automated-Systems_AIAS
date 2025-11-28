"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";
import FadeIn from "@/components/motion/fade-in";
import { motion } from "framer-motion";
import { Sparkles, Zap, DollarSign, Lock, FileText } from "lucide-react";

const features = [
  {
    title: "No-Code AI Agents",
    description: "Build custom AI agents with drag-and-drop interface. No coding required. Deploy in 30 minutes.",
    icon: Sparkles,
    gradient: "from-blue-500 to-cyan-500",
    highlight: true,
  },
  {
    title: "Canadian Integrations",
    description: "20+ Canadian-first integrations: Shopify, Wave Accounting, Stripe CAD, RBC, TD, Interac. Built for Canadian businesses.",
    icon: Zap,
    gradient: "from-red-500 to-pink-500",
  },
  {
    title: "Save 10+ Hours/Week",
    description: "Automate repetitive tasks automatically. Reduce manual errors by 90%. Focus on high-value work.",
    icon: Zap,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Affordable CAD Pricing",
    description: "CAD $49/month (vs. $150+ competitors). Transparent GST/HST. Annual discounts available. Cancel anytime.",
    icon: DollarSign,
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "PIPEDA Compliant",
    description: "Canadian data residency. PIPEDA-compliant privacy policy. Enterprise security. Your data stays in Canada.",
    icon: Lock,
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    title: "50+ Pre-Built Templates",
    description: "E-commerce automation, customer support, invoice processing, lead qualification. Industry-specific templates.",
    icon: FileText,
    gradient: "from-pink-500 to-rose-500",
  },
];

export function Features() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
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
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
          >
            Why Systems Thinking + AI = Success
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            Systems thinking is THE critical skill for the AI age. It's what makes you stand out in the job market, 
            succeed in business, and achieve optimal outcomes. Combined with AI automation, it's unstoppable.
          </motion.p>
        </div>
      </FadeIn>
      
      <StaggerList>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={feature.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="h-full"
                >
                  <Card className={`h-full card-hover border-2 transition-all duration-300 ${
                    feature.highlight 
                      ? 'border-primary/50 shadow-lg shadow-primary/10 bg-gradient-to-br from-primary/5 to-transparent' 
                      : 'border-border hover:border-primary/30'
                  }`}>
                    <CardHeader className="pb-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 shadow-lg`}
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
                </motion.div>
              </StaggerItem>
            );
          })}
        </div>
      </StaggerList>
    </section>
  );
}
