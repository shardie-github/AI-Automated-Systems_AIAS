"use client";
import { Badge } from "@/components/ui/badge";

interface SponsoredBadgeProps {
  sponsor?: string;
  variant?: "default" | "outline";
  systemsThinkingNote?: string; // How this sponsor aligns with systems thinking
}

export function SponsoredBadge({ sponsor, variant = "outline", systemsThinkingNote }: SponsoredBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <Badge variant={variant} className="bg-primary/10 text-primary border-primary/20">
        {sponsor ? `Sponsored by ${sponsor}` : "Sponsored"}
      </Badge>
      {systemsThinkingNote && (
        <span className="text-xs text-muted-foreground" title={systemsThinkingNote}>
          🧠 Systems Thinking Partner
        </span>
      )}
    </div>
  );
}
