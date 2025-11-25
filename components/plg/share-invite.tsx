"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Mail, Share2 } from "lucide-react";
import { track } from "@/lib/telemetry/track";

interface ShareInviteProps {
  userId?: string;
  referralCode?: string;
}

export function ShareInvite({ userId, referralCode }: ShareInviteProps) {
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    if (referralCode) {
      const baseUrl = window.location.origin;
      setInviteLink(`${baseUrl}/signup?ref=${referralCode}`);
    }
  }, [referralCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Track invite link copy
      if (userId) {
        track(userId, {
          type: "invite_link_copied",
          path: window.location.pathname,
          meta: {
            referral_code: referralCode,
            timestamp: new Date().toISOString(),
          },
          app: "web",
        });
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join AIAS Platform",
          text: "Automate your business workflows with AIAS Platform",
          url: inviteLink,
        });

        // Track share
        if (userId) {
          track(userId, {
            type: "invite_shared",
            path: window.location.pathname,
            meta: {
              referral_code: referralCode,
              method: "native_share",
              timestamp: new Date().toISOString(),
            },
            app: "web",
          });
        }
      } catch (err) {
        console.error("Failed to share:", err);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Friends</CardTitle>
        <CardDescription>
          Share AIAS Platform with friends and unlock Pro features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={inviteLink}
            readOnly
            className="flex-1"
            placeholder="Generating invite link..."
          />
          <Button onClick={handleCopy} variant="outline" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
          {navigator.share && (
            <Button onClick={handleShare} variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {copied && (
          <p className="text-sm text-green-600">Link copied to clipboard!</p>
        )}
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Invite 3 friends</strong> to unlock Pro features for free. Each friend who signs up gets you one step closer!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
