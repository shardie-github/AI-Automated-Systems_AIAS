"use client";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer 
      className="border-t border-border bg-gradient-to-b from-background to-muted/20 py-12 md:py-16 text-sm text-muted-foreground mt-auto"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="font-bold text-lg text-foreground">AIAS Platform</h3>
            </div>
            <p className="text-sm mb-4 leading-relaxed">
              Custom AI platforms, workflow automation systems, and intelligent agents. AIAS Consultancy builds complete solutions 
              (like TokPulse and Hardonia Suite) while AIAS Platform powers business automation.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">🚀 Custom Builds</span>
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">🤖 AI Agents</span>
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">🇨🇦 Built in Canada</span>
            </div>
          </motion.div>
          {[
            {
              title: "Product",
              links: [
                { href: "/services", label: "Services" },
                { href: "/portfolio", label: "Portfolio" },
                { href: "/process", label: "Our Process" },
                { href: "/case-studies", label: "Case Studies" },
                { href: "/tasks", label: "Our Builds" },
                { href: "/pricing", label: "Platform Pricing" },
                { href: "/features", label: "Features" },
              ],
            },
            {
              title: "Resources",
              links: [
                { href: "/blog", label: "Blog (Daily Articles)" },
                { href: "/rss-news", label: "AI & Tech News Feed" },
                { href: "/help", label: "Help Center" },
                { href: "/demo", label: "Book Demo" },
                { href: "/status", label: "Status" },
              ],
            },
            {
              title: "Company",
              links: [
                { href: "/about", label: "About" },
                { href: "/tasks", label: "Consultancy Builds" },
                { href: "/why-canadian", label: "Why Canadian" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/trust", label: "Trust Center" },
              ],
            },
          ].map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h4 className="font-bold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-3" role="list">
                {section.links.map((link) => (
                  <li key={link.href} role="listitem">
                    <Link
                      href={link.href}
                      className="hover:text-foreground hover:underline transition-colors inline-block min-h-[44px] flex items-center"
                      aria-label={`Navigate to ${link.label}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mb-6">
            {[
              { href: "/trust", label: "Trust Center" },
              { href: "/privacy", label: "Privacy" },
              { href: "/status", label: "Status" },
              { href: "/help", label: "Help" },
              { href: "mailto:support@aias-platform.com", label: "Support" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-foreground hover:underline transition-colors min-h-[44px] flex items-center"
                aria-label={`Navigate to ${link.label}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {[
              { icon: "🔒", text: "PIPEDA Compliant" },
              { icon: "🛡️", text: "SOC 2 (In Progress)" },
              { icon: "🇨🇦", text: "Canadian Data Residency" },
              { icon: "✅", text: "99.9% Uptime SLA" },
            ].map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-sm hover:shadow-md transition-all"
              >
                <span>{badge.icon}</span>
                <span className="text-xs font-medium text-foreground">{badge.text}</span>
              </motion.div>
            ))}
          </div>
          <div className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} AIAS Consultancy / AI Automated Services. All rights reserved.
            <br />
            <span className="mt-2 inline-block">Built in Canada 🇨🇦 • Serving the World 🌍</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
