"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, ArrowRight, Zap, Shield, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { DashboardPreview } from "@/components/dashboard/dashboard-preview";

export function SettlerShowcase() {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 dark:from-blue-950/10 dark:via-background dark:to-purple-950/10">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <Card className="border-2 bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <Badge variant="secondary" className="text-sm">
                  Partner Product
                </Badge>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Settler — Enterprise Payment Platform
              </CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                High-volume payment processing and settlement platform. Built by AI Automated Systems 
                for marketplaces, SaaS platforms, and fintech companies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">High-Volume Processing</h4>
                    <p className="text-sm text-muted-foreground">
                      Handle millions of transactions with enterprise infrastructure
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Bank-Grade Security</h4>
                    <p className="text-sm text-muted-foreground">
                      PCI DSS compliant with end-to-end encryption
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Canadian Compliance</h4>
                    <p className="text-sm text-muted-foreground">
                      PIPEDA & FINTRAC ready with audit trails
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 border-t">
                <Button size="lg" asChild>
                  <Link href="/settler">
                    Explore Settler
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/services">View All Services</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Dashboard Preview */}
      <div className="container mt-12">
        <DashboardPreview
          title="Settler Analytics Dashboard"
          description="Request access to view live transaction analytics and settlement insights"
          variant="settler"
          onRequestPreview={() => {
            window.location.href = "/settler#demo-cta";
          }}
        />
      </div>
    </section>
  );
}
