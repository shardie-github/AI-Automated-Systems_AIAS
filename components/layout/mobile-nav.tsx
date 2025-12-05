"use client";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu } from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="min-h-[44px] min-w-[44px]"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-64"
        aria-label="Mobile navigation"
        id="mobile-navigation"
      >
        <nav 
          className="flex flex-col gap-4 mt-8"
          role="navigation"
          aria-label="Mobile navigation menu"
        >
          <Link 
            href="/services" 
            onClick={() => setOpen(false)} 
            className="text-lg font-medium hover:underline min-h-[44px] flex items-center"
            aria-label="Navigate to Services"
          >
            Services
          </Link>
          <Link 
            href="/edge-ai" 
            onClick={() => setOpen(false)} 
            className="text-lg font-medium hover:underline min-h-[44px] flex items-center"
            aria-label="Navigate to Edge AI Accelerator Studio"
          >
            Edge AI
          </Link>
          <Link 
            href="/portfolio" 
            onClick={() => setOpen(false)} 
            className="text-lg font-medium hover:underline min-h-[44px] flex items-center"
            aria-label="Navigate to Portfolio"
          >
            Portfolio
          </Link>
          <Link 
            href="/tasks" 
            onClick={() => setOpen(false)} 
            className="text-lg font-medium hover:underline min-h-[44px] flex items-center"
            aria-label="Navigate to Our Builds"
          >
            Our Builds
          </Link>
          <Link 
            href="/case-studies" 
            onClick={() => setOpen(false)} 
            className="text-lg font-medium hover:underline min-h-[44px] flex items-center"
            aria-label="Navigate to Case Studies"
          >
            Case Studies
          </Link>
          <Link 
            href="/pricing" 
            onClick={() => setOpen(false)} 
            className="text-lg font-medium hover:underline min-h-[44px] flex items-center"
            aria-label="Navigate to Platform Pricing"
          >
            Platform Pricing
          </Link>
          <Link 
            href="/features" 
            onClick={() => setOpen(false)} 
            className="text-lg font-medium hover:underline min-h-[44px] flex items-center"
            aria-label="Navigate to Features"
          >
            Features
          </Link>
          <Link 
            href="/systems-thinking" 
            onClick={() => setOpen(false)} 
            className="text-lg font-medium hover:underline text-primary min-h-[44px] flex items-center"
            aria-label="Navigate to Systems Thinking"
          >
            Systems Thinking
          </Link>
          <Link 
            href="/blog" 
            onClick={() => setOpen(false)} 
            className="text-lg font-medium hover:underline min-h-[44px] flex items-center"
            aria-label="Navigate to Blog"
          >
            Blog
          </Link>
          <Link 
            href="/about" 
            onClick={() => setOpen(false)} 
            className="text-lg font-medium hover:underline min-h-[44px] flex items-center"
            aria-label="Navigate to About"
          >
            About
          </Link>
          <Link 
            href="/demo" 
            onClick={() => setOpen(false)} 
            className="text-lg font-medium hover:underline min-h-[44px] flex items-center"
            aria-label="Navigate to Demo"
          >
            Demo
          </Link>
          <div className="pt-4 border-t space-y-3">
            <Button className="w-full min-h-[48px] font-bold text-base shadow-lg" asChild>
              <Link 
                href="/signup" 
                onClick={() => setOpen(false)}
                aria-label="Start your 14-day free trial - no credit card required"
              >
                Start Free Trial
              </Link>
            </Button>
            <Button variant="outline" className="w-full min-h-[48px] font-semibold text-base" asChild>
              <Link 
                href="/demo" 
                onClick={() => setOpen(false)}
                aria-label="Schedule a free strategy call"
              >
                Schedule Call
              </Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
