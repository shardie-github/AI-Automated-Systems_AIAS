"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield, Globe, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { TextReveal } from "@/components/ui/TextReveal";
import { ParallaxBackground } from "@/components/ui/ParallaxBackground";

const socialProof = [
  { icon: "👥", text: "2,000+ Active Users" },
  { icon: "⭐", text: "4.9/5 Rating" },
  { icon: "🚀", text: "10+ Hours Saved/Week" },
  { icon: "💰", text: "40% ROI Increase" },
];

const trustBadges = [
  { icon: Shield, text: "PIPEDA Compliant", color: "text-blue-500" },
  { icon: Globe, text: "🇨🇦 Canadian Built", color: "text-red-500" },
  { icon: CheckCircle2, text: "99.9% Uptime", color: "text-green-500" },
  { icon: Zap, text: "Enterprise Security", color: "text-purple-500" },
];

export function EnhancedHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <ParallaxBackground className="relative py-16 md:py-24 lg:py-32 xl:py-40 overflow-hidden min-h-[90vh] flex items-center">
      <section 
        className="relative w-full"
        aria-label="Hero section"
      >
        {/* Enhanced animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background via-50% to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      <div className="relative container text-center space-y-8 max-w-6xl mx-auto z-10 px-4">
        {/* Social proof bar - mobile optimized */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs md:text-sm font-medium mb-4"
        >
          {socialProof.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all"
            >
              <span className="text-base md:text-lg">{item.icon}</span>
              <span className="text-foreground font-semibold">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 text-primary text-sm md:text-base font-bold border-2 border-primary/30 shadow-xl backdrop-blur-md"
        >
          <Sparkles className="h-4 w-4 md:h-5 md:w-5 animate-pulse" aria-hidden="true" />
          <span>Custom AI Platforms Built by AI Automated Systems</span>
        </motion.div>
        
        {/* Main headline - mobile responsive with TextReveal */}
        <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[1.1] px-2">
          <TextReveal
            as="h1"
            className="block"
            delay={0.3}
            staggerDelay={0.05}
          >
            Custom AI Platforms
          </TextReveal>
          <TextReveal
            as="h1"
            className="block mt-2 md:mt-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
            delay={0.5}
            staggerDelay={0.05}
          >
            That Transform Your Business
          </TextReveal>
        </div>
        
        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium px-4"
        >
          We don't sell software. We architect, build, and deploy{" "}
          <span className="text-foreground font-bold">custom AI solutions</span> — 
          from TikTok analytics platforms to e-commerce automation ecosystems.
        </motion.p>
        
        {/* Value propositions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs md:text-sm pt-2 px-4"
        >
          {[
            { icon: Zap, text: "Built TokPulse & Hardonia Suite", color: "text-yellow-500" },
            { icon: Sparkles, text: "Custom AI Agents & Workflows", color: "text-purple-500" },
            { icon: TrendingUp, text: "40% Average ROI Increase", color: "text-green-500" },
            { icon: Clock, text: "8-16 Week Delivery", color: "text-blue-500" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md hover:border-primary/50 transition-all"
              >
                <Icon className={`h-4 w-4 md:h-5 md:w-5 ${item.color}`} aria-hidden="true" />
                <span className="text-foreground font-semibold whitespace-nowrap">{item.text}</span>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Primary CTAs - mobile optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-6 md:pt-8 px-4"
        >
          <Button 
            size="lg" 
            className="text-base md:text-lg px-6 md:px-10 h-12 md:h-14 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 group min-h-[48px] w-full sm:w-auto" 
            asChild
          >
            <Link href="/demo" aria-label="Schedule a free strategy call - no credit card required">
              <span className="flex items-center justify-center gap-2">
                Schedule Free Strategy Call
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </span>
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-base md:text-lg px-6 md:px-10 h-12 md:h-14 font-bold border-2 hover:bg-primary/5 hover:border-primary/50 transition-all hover:scale-105 min-h-[48px] w-full sm:w-auto" 
            asChild
          >
            <Link href="/tasks" aria-label="View our portfolio and case studies">
              See Our Builds
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="ghost" 
            className="text-base md:text-lg px-6 md:px-10 h-12 md:h-14 font-bold hover:bg-primary/10 transition-all hover:scale-105 min-h-[48px] w-full sm:w-auto" 
            asChild
          >
            <Link href="/signup" aria-label="Start your 14-day free trial - no credit card required">
              Try AI Automated Systems Free
            </Link>
          </Button>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="pt-8 md:pt-12 space-y-4 px-4"
        >
          <p className="text-sm md:text-base text-muted-foreground font-semibold">
            Trusted by e-commerce brands, agencies, and enterprises worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
            {trustBadges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all"
                >
                  <Icon className={`h-4 w-4 md:h-5 md:w-5 ${badge.color}`} aria-hidden="true" />
                  <span className="text-xs md:text-sm font-semibold text-foreground">{badge.text}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Urgency CTA - mobile friendly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="pt-6 md:pt-8 px-4"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-2 border-primary/30 shadow-lg backdrop-blur-sm">
            <span className="text-xs md:text-sm font-semibold text-foreground">
              🎁 Limited Time: Free Strategy Call + 14-Day Trial
            </span>
            <Button size="sm" variant="default" className="h-8 md:h-9 text-xs md:text-sm font-bold" asChild>
              <Link href="/signup">Claim Offer</Link>
            </Button>
          </div>
        </motion.div>
      </div>
      </section>
    </ParallaxBackground>
  );
}
