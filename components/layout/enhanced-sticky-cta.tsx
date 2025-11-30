"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, X, Sparkles, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function EnhancedStickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Calculate time until end of day for urgency
    const updateTime = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    const handleScroll = () => {
      // Show after scrolling 400px
      if (window.scrollY > 400 && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, [isDismissed]);

  // Check localStorage for dismissal
  useEffect(() => {
    const dismissed = localStorage.getItem("cta-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem("cta-dismissed", "true");
    // Re-enable after 24 hours
    setTimeout(() => {
      localStorage.removeItem("cta-dismissed");
    }, 24 * 60 * 60 * 1000);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl"
        role="banner"
        aria-label="Call to action"
      >
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="bg-gradient-to-r from-primary/95 via-primary to-accent/95 backdrop-blur-md border-2 border-primary/50 rounded-lg md:rounded-xl shadow-2xl p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
            {/* Content */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-white animate-pulse" aria-hidden="true" />
                <div className="font-bold text-sm md:text-base text-white">
                  Ready to Transform Your Business?
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs md:text-sm text-white/90">
                <span>Schedule a free strategy call</span>
                <span className="hidden sm:inline">•</span>
                <span>See our builds</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {timeLeft} left today
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
              <Button 
                size="sm" 
                className="flex-1 sm:flex-none h-9 md:h-10 text-xs md:text-sm font-bold bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all hover:scale-105 min-h-[36px]" 
                asChild
              >
                <Link href="/demo" aria-label="Schedule a free strategy call">
                  <span className="flex items-center justify-center gap-1">
                    Schedule Call
                    <ArrowRight className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-9 w-9 md:h-10 md:w-10 p-0 text-white hover:bg-white/20 hover:text-white min-h-[36px] min-w-[36px]"
                onClick={handleDismiss}
                aria-label="Dismiss this message"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
