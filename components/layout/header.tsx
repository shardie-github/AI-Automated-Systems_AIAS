"use client";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function Header() {
  return (
    <header 
      className="sticky top-0 z-50 backdrop-blur-md bg-bg/80 border-b border-border/50 shadow-sm"
      role="banner"
    >
      <div className="container flex items-center justify-between h-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link 
            href="/" 
            className="font-bold text-xl flex items-center gap-2 hover:opacity-80 transition-opacity group"
            aria-label="AI Automated Systems - Home"
          >
            <Sparkles 
              className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" 
              aria-hidden="true"
            />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Automated Systems
            </span>
          </Link>
        </motion.div>
        
        <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
          {[
            { href: "/services", label: "Services" },
            { href: "/settler", label: "Settler" },
            { href: "/edge-ai", label: "Edge AI" },
            { href: "/portfolio", label: "Portfolio" },
            { href: "/tasks", label: "Our Builds" },
            { href: "/case-studies", label: "Case Studies" },
            { href: "/pricing", label: "Pricing" },
            { href: "/features", label: "Features" },
            { href: "/why-canadian", label: "🇨🇦 Why Canadian" },
            { href: "/blog", label: "Blog" },
          ].map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-all relative group min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={`Navigate to ${item.label}`}
              >
                {item.label}
                <span 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" 
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          ))}
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Button 
              size="sm" 
              className="ml-2 font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 min-h-[44px]" 
              asChild
            >
              <Link href="/signup" aria-label="Start your free trial">Start Free Trial</Link>
            </Button>
          </motion.div>
          
          <ThemeToggle />
        </nav>
        
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
