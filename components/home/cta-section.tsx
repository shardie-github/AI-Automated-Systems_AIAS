"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FadeIn from "@/components/motion/fade-in";
import { Sparkles, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Enhanced background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
      
      <FadeIn>
        <div className="container max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-2 border-primary/30 shadow-2xl bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-6 shadow-xl"
                >
                  <Sparkles className="h-10 w-10 text-white" />
                </motion.div>
                <CardTitle className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Start Saving 10+ Hours/Week Today
                </CardTitle>
                <CardDescription className="text-lg md:text-xl max-w-2xl mx-auto">
                  Join 2,000+ businesses worldwide automating with AIAS Platform. 
                  No credit card required. 30-day free trial. Cancel anytime.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: Zap, title: "30-Minute Setup", desc: "Get started in minutes, not days" },
                    { icon: Sparkles, title: "100+ Integrations", desc: "Connect your existing tools" },
                    { icon: Shield, title: "PIPEDA Compliant", desc: "Enterprise security & privacy" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground mb-1">{item.title}</div>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 p-6 rounded-xl border-2 border-primary/20"
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      CAD $49/month
                    </span>
                  </div>
                  <p className="text-center text-foreground font-semibold mb-3">
                    Transparent pricing, no hidden fees
                  </p>
                  <p className="text-center text-sm text-muted-foreground mb-3">
                    Save 10+ hours/week • Reduce errors by 90% • Focus on high-value work
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                    <span className="px-3 py-1 rounded-full bg-card border border-border font-medium">🇨🇦 Built in Canada</span>
                    <span className="px-3 py-1 rounded-full bg-card border border-border font-medium">🌍 Trusted Worldwide</span>
                    <span className="px-3 py-1 rounded-full bg-card border border-border font-medium">🔒 Enterprise Security</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Button 
                    size="lg" 
                    className="text-lg px-10 h-14 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 group" 
                    asChild
                  >
                    <Link href="/signup">
                      Start 30-Day Free Trial
                      <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-10 h-14 font-bold border-2 hover:bg-primary/5 hover:border-primary/50 transition-all hover:scale-105" 
                    asChild
                  >
                    <Link href="/demo">Book Demo</Link>
                  </Button>
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="text-sm text-muted-foreground text-center font-medium"
                >
                  ✨ No credit card required • 🎁 30-day free trial • 🔄 Cancel anytime
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </FadeIn>
    </section>
  );
}
