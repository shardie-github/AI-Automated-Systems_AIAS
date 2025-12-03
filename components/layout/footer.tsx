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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="font-bold text-lg text-foreground">AI Automated Systems</h3>
            </div>
            <p className="text-sm mb-6 leading-relaxed max-w-sm">
              Custom AI platforms, workflow automation systems, and intelligent agents. AI Automated Systems builds complete solutions 
              (like TokPulse and Hardonia Suite) while the AIAS Platform powers business automation for our SaaS customers.
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
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mb-8">
            {[
              { href: "/trust", label: "Trust Center" },
              { href: "/privacy", label: "Privacy" },
              { href: "/status", label: "Status" },
              { href: "/help", label: "Help" },
              { href: "mailto:support@aiautomatedsystems.ca", label: "Support" },
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
          <div className="flex flex-wrap justify-center gap-3 mb-8">
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
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/shardie-github/aias"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Visit our GitHub repository"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} AI Automated Systems. All rights reserved.
              <br />
              <span className="mt-2 inline-block">Built in Canada 🇨🇦 • Serving the World 🌍</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
