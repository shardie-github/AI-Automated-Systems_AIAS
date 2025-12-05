"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Eye, Lock, BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";
import { useState } from "react";

interface DashboardPreviewProps {
  title?: string;
  description?: string;
  onRequestPreview?: () => void;
  variant?: "default" | "settler" | "analytics";
}

const dashboardVariants = {
  settler: {
    colors: ["from-blue-500/20", "via-purple-500/20", "to-blue-600/20"],
    accent: "blue",
    charts: [
      { type: "line", label: "Transaction Volume", value: "2.4M", trend: "+12%" },
      { type: "bar", label: "Settlement Status", value: "98.2%", trend: "+2.1%" },
      { type: "pie", label: "Payment Methods", value: "Multi", trend: null },
    ],
  },
  analytics: {
    colors: ["from-green-500/20", "via-emerald-500/20", "to-teal-500/20"],
    accent: "green",
    charts: [
      { type: "line", label: "Revenue", value: "$1.2M", trend: "+24%" },
      { type: "bar", label: "Active Users", value: "45K", trend: "+8%" },
      { type: "pie", label: "Conversion", value: "3.2%", trend: "+0.5%" },
    ],
  },
  default: {
    colors: ["from-primary/20", "via-accent/20", "to-primary/20"],
    accent: "primary",
    charts: [
      { type: "line", label: "Performance", value: "99.9%", trend: "+0.1%" },
      { type: "bar", label: "Usage", value: "High", trend: "+5%" },
      { type: "pie", label: "Distribution", value: "Balanced", trend: null },
    ],
  },
};

export function DashboardPreview({ 
  title = "Dashboard Preview",
  description = "Request access to view live analytics and insights",
  onRequestPreview,
  variant = "default"
}: DashboardPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = dashboardVariants[variant];
  const accentColor = config.accent === "blue" ? "blue" : config.accent === "green" ? "green" : "primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="relative overflow-hidden border-2 group cursor-pointer">
        {/* Generative dashboard background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.colors.join(" ")} opacity-50`} />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        <CardContent className="relative p-0">
          {/* Dashboard header */}
          <div className="p-6 border-b border-border/50 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard content area with chart placeholders */}
          <div className="p-6 space-y-4 min-h-[400px]">
            {/* Top metrics row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {config.charts.map((chart, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {chart.label}
                      </span>
                      {chart.type === "line" && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {chart.type === "bar" && <BarChart3 className="h-4 w-4 text-blue-500" />}
                      {chart.type === "pie" && <PieChart className="h-4 w-4 text-purple-500" />}
                    </div>
                    <div className="text-2xl font-bold mb-1">{chart.value}</div>
                    {chart.trend && (
                      <div className="text-xs text-green-500 font-medium">{chart.trend}</div>
                    )}
                    
                    {/* Chart visualization placeholder */}
                    <div className="mt-4 h-24 relative overflow-hidden rounded">
                      <div className={`absolute inset-0 ${
                        accentColor === "blue" 
                          ? "bg-gradient-to-br from-blue-500/10 to-blue-600/5"
                          : accentColor === "green"
                          ? "bg-gradient-to-br from-green-500/10 to-green-600/5"
                          : "bg-gradient-to-br from-primary/10 to-primary/5"
                      }`} />
                      
                      {/* Animated chart lines/bars */}
                      {chart.type === "line" && (
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                          <motion.path
                            d="M 10 80 Q 50 60, 90 50 T 170 30"
                            stroke={`rgb(59, 130, 246)`}
                            strokeWidth="2"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: index * 0.2 }}
                          />
                          <motion.path
                            d="M 10 90 Q 50 70, 90 60 T 170 40"
                            stroke={`rgb(139, 92, 246)`}
                            strokeWidth="2"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: index * 0.2 + 0.3 }}
                          />
                        </svg>
                      )}
                      
                      {chart.type === "bar" && (
                        <div className="absolute inset-0 flex items-end justify-around gap-2 p-2">
                          {[65, 80, 45, 90, 70, 85].map((height, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              whileInView={{ height: `${height}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, delay: index * 0.2 + i * 0.1 }}
                              className={`flex-1 rounded-t opacity-80 ${
                                accentColor === "blue"
                                  ? "bg-gradient-to-t from-blue-500 to-blue-400"
                                  : accentColor === "green"
                                  ? "bg-gradient-to-t from-green-500 to-green-400"
                                  : "bg-gradient-to-t from-primary to-primary/80"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      
                      {chart.type === "pie" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-20 h-20">
                            <motion.circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke={`rgb(59, 130, 246)`}
                              strokeWidth="8"
                              strokeDasharray={`${2 * Math.PI * 40 * 0.6} ${2 * Math.PI * 40}`}
                              strokeDashoffset={2 * Math.PI * 40 * 0.25}
                              initial={{ rotate: -90 }}
                              whileInView={{ rotate: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                            />
                            <motion.circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke={`rgb(139, 92, 246)`}
                              strokeWidth="8"
                              strokeDasharray={`${2 * Math.PI * 40 * 0.4} ${2 * Math.PI * 40}`}
                              strokeDashoffset={2 * Math.PI * 40 * 0.6}
                              initial={{ rotate: -90 }}
                              whileInView={{ rotate: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: index * 0.2 + 0.3 }}
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom chart area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold">Real-Time Activity</span>
                </div>
                <div className="h-32 relative overflow-hidden rounded">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/5" />
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                    <motion.path
                      d="M 0 100 Q 75 80, 150 60 T 300 40"
                      stroke="rgb(59, 130, 246)"
                      strokeWidth="2"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 2 }}
                    />
                    <motion.path
                      d="M 0 110 Q 75 90, 150 70 T 300 50"
                      stroke="rgb(139, 92, 246)"
                      strokeWidth="2"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, delay: 0.3 }}
                    />
                  </svg>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-semibold">Performance Metrics</span>
                </div>
                <div className="h-32 relative overflow-hidden rounded">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/5" />
                  <div className="absolute inset-0 flex items-end justify-around gap-1 p-2">
                    {[40, 60, 35, 75, 50, 65, 45, 80, 55, 70].map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 + i * 0.05 }}
                        className="flex-1 bg-gradient-to-t from-purple-500 to-blue-400 rounded-t opacity-70"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Preview Upon Request Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0.7 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-md flex items-center justify-center flex-col gap-4 p-8"
          >
            <motion.div
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Lock className="h-10 w-10 text-white" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h4 className="text-2xl font-bold flex items-center gap-2">
                  <Eye className="h-6 w-6" />
                  Preview Upon Request
                </h4>
                <p className="text-muted-foreground max-w-md">
                  This dashboard preview is available upon request. Contact us to see live analytics, 
                  real-time data, and custom insights tailored to your needs.
                </p>
              </div>

              {onRequestPreview && (
                <Button 
                  size="lg" 
                  onClick={onRequestPreview}
                  className="mt-4"
                >
                  Request Preview Access
                  <Eye className="ml-2 h-5 w-5" />
                </Button>
              )}
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
