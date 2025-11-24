"use client";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/motion/fade-in";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* Enhanced background with animated gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background via-50% to-accent/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <FadeIn>
        <div className="relative container text-center space-y-8 max-w-5xl mx-auto z-10">
          {/* Enhanced trust badge with animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 text-primary text-sm font-semibold border border-primary/30 shadow-lg backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Custom AI Platforms Built by AIAS Consultancy</span>
          </motion.div>
          
          {/* Enhanced headline with better typography */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[1.1]"
          >
            <span className="block">Custom AI Platforms</span>
            <span 
              className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
              aria-label="That Transform Your Business"
            >
              That Transform Your Business
            </span>
          </motion.h1>
          
          {/* Enhanced subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium"
          >
            We don't sell software. We architect, build, and deploy{" "}
            <span className="text-foreground font-semibold">custom AI solutions</span> — 
            from TikTok analytics platforms to e-commerce automation ecosystems.
          </motion.p>
          
          {/* Enhanced proof points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base pt-4"
          >
            {[
              { icon: Zap, text: "Built TokPulse & Hardonia Suite" },
              { icon: Sparkles, text: "Custom AI Agents & Workflows" },
              { icon: Shield, text: "From Strategy to Deployment" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
                role="listitem"
              >
                <item.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-foreground font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Enhanced CTAs with hover effects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <Button 
              size="lg" 
              className="text-base px-8 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 group min-h-[44px]" 
              asChild
            >
              <Link href="/demo" aria-label="Schedule a strategy call">
                Schedule Strategy Call
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-base px-8 h-14 text-lg font-semibold border-2 hover:bg-primary/5 hover:border-primary/50 transition-all hover:scale-105 min-h-[44px]" 
              asChild
            >
              <Link href="/tasks" aria-label="View our builds and portfolio">
                See Our Builds
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="ghost" 
              className="text-base px-8 h-14 text-lg font-semibold hover:bg-primary/10 transition-all hover:scale-105 min-h-[44px]" 
              asChild
            >
              <Link href="/pricing" aria-label="Try AIAS Platform free trial">
                Try AIAS Platform
              </Link>
            </Button>
          </motion.div>
          
          {/* Enhanced trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="pt-12 space-y-3"
          >
            <p className="text-sm md:text-base text-muted-foreground font-medium">
              Trusted by e-commerce brands, agencies, and enterprises worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base">
              <div className="flex items-center gap-2 text-foreground">
                <Globe className="h-4 w-4 text-primary" />
                <span className="font-medium">🇨🇦 Built in Canada</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Globe className="h-4 w-4 text-primary" />
                <span className="font-medium">🌍 Serving Global Clients</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">🔒 Enterprise Security</span>
              </div>
            </div>
          </motion.div>
        </div>
      </FadeIn>
    </section>
  );
}
