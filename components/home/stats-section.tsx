/**
 * Stats Section Component
 * Showcase impressive metrics and social proof
 */

"use client";

import { motion } from "framer-motion";
import { Users, Zap, Globe, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "2,000+",
    label: "Active Users",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    value: "10+",
    label: "Hours Saved/Week",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Globe,
    value: "40+",
    label: "Countries Served",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: TrendingUp,
    value: "90%",
    label: "Error Reduction",
    gradient: "from-orange-500 to-red-500",
  },
];

export function StatsSection() {
  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </motion.div>
                <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
