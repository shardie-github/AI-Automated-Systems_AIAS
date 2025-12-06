"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, RefreshCw, Eye } from "lucide-react";
import { ContentStudioHero } from "@/components/content-studio/ContentStudioHero";
import { ContentStudioFeatures } from "@/components/content-studio/ContentStudioFeatures";
import { ContentStudioTestimonials } from "@/components/content-studio/ContentStudioTestimonials";
import { ContentStudioFAQ } from "@/components/content-studio/ContentStudioFAQ";
import { ContentTemplates } from "@/components/content-studio/ContentTemplates";
import type { AIASContent, SettlerContent } from "@/lib/content/schemas";

export default function ContentStudioPage() {
  const { toast } = useToast();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSite, setActiveSite] = useState<"aias" | "settler">("aias");
  const [aiasContent, setAiasContent] = useState<AIASContent | null>(null);
  const [settlerContent, setSettlerContent] = useState<SettlerContent | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [token, setToken] = useState<string>("");

  // Check if already authenticated (stored in sessionStorage)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const auth = sessionStorage.getItem("content_studio_auth");
    const storedToken = sessionStorage.getItem("content_studio_token");
    if (storedToken) {
      setToken(storedToken);
    }
    if (auth === "true") {
      setAuthenticated(true);
      loadContent();
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !hasChanges || !authenticated || saving) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save (5 seconds after last change)
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (hasChanges && !saving) {
        handleSave(true); // Silent save for auto-save
      }
    }, 5000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiasContent, settlerContent, hasChanges, autoSaveEnabled, authenticated, saving]);

  // Try to get token from admin session on mount
  useEffect(() => {
    const tryAdminAuth = async () => {
      try {
        const response = await fetch("/api/content/auth");
        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            if (typeof window !== "undefined") {
              sessionStorage.setItem("content_studio_auth", "true");
              sessionStorage.setItem("content_studio_token", data.token);
            }
            setToken(data.token);
            setAuthenticated(true);
            await loadContent();
            return;
          }
        }
      } catch (error) {
        // Silent fail - user can still use manual token
        console.log("Admin session auth not available");
      }
    };
    
    if (authenticated === false) {
      tryAdminAuth();
    }
  }, [authenticated]);

  const handleLogin = async () => {
    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter the access token or sign in as admin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First try to verify as admin token
      const verifyResponse = await fetch("/api/content/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: password }),
      });

      if (verifyResponse.ok) {
        // Valid admin token
        if (typeof window !== "undefined") {
          sessionStorage.setItem("content_studio_auth", "true");
          sessionStorage.setItem("content_studio_token", password);
        }
        setToken(password);
        setAuthenticated(true);
        await loadContent();
        toast({
          title: "Authenticated",
          description: "You can now edit content",
        });
        return;
      }

      // Fallback: Test with legacy token method
      const response = await fetch("/api/content/aias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({}), // Empty body just to test auth
      });

      // If we get 401, token is wrong
      if (response.status === 401) {
        throw new Error("Invalid token");
      }

      // Otherwise, assume it's valid
      if (typeof window !== "undefined") {
        sessionStorage.setItem("content_studio_auth", "true");
        sessionStorage.setItem("content_studio_token", password);
      }
      setToken(password);
      setAuthenticated(true);
      await loadContent();
      toast({
        title: "Authenticated",
        description: "You can now edit content",
      });
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Invalid token. If you're an admin, try signing in first.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async () => {
    setLoading(true);
    try {
      const [aiasRes, settlerRes] = await Promise.all([
        fetch("/api/content/aias"),
        fetch("/api/content/settler"),
      ]);

      if (aiasRes.ok) {
        const aias = await aiasRes.json();
        setAiasContent(aias);
      }

      if (settlerRes.ok) {
        const settler = await settlerRes.json();
        setSettlerContent(settler);
      }
    } catch (error) {
      toast({
        title: "Error loading content",
        description: "Failed to load content. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (silent = false) => {
    if (!hasChanges && !silent) {
      toast({
        title: "No changes",
        description: "No changes to save",
      });
      return;
    }

    setSaving(true);
    try {
      const currentToken = typeof window !== "undefined" 
        ? sessionStorage.getItem("content_studio_token") || token || password
        : token || password;
      if (!currentToken) {
        throw new Error("Not authenticated");
      }

      const content = activeSite === "aias" ? aiasContent : settlerContent;
      if (!content) {
        throw new Error("No content to save");
      }

      const endpoint = activeSite === "aias" ? "/api/content/aias" : "/api/content/settler";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save");
      }

      setHasChanges(false);
      if (!silent) {
        toast({
          title: "Saved successfully",
          description: "Your changes have been saved.",
        });
      }
    } catch (error: any) {
      if (!silent) {
        toast({
          title: "Error saving",
          description: error.message || "Failed to save content",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadContent();
    setHasChanges(false);
    toast({
      title: "Reset",
      description: "Changes discarded",
    });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Content Studio Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                placeholder="Enter access token"
              />
            </div>
            <Button
              onClick={handleLogin}
              disabled={loading || !password}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Authenticate"
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              If you're an admin, sign in to your account first, or enter your Content Studio token.
            </p>
            <Button
              variant="outline"
              onClick={async () => {
                // Try to get token from admin session
                try {
                  const response = await fetch("/api/content/auth");
                  if (response.ok) {
                    const data = await response.json();
                    if (data.token) {
                      setPassword(data.token);
                      setToken(data.token);
                      await handleLogin();
                    } else {
                      toast({
                        title: "Not an admin",
                        description: "You need admin privileges to access Content Studio.",
                        variant: "destructive",
                      });
                    }
                  } else {
                    toast({
                      title: "Not signed in",
                      description: "Please sign in to your admin account first.",
                      variant: "destructive",
                    });
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Could not verify admin status. Please sign in first.",
                    variant: "destructive",
                  });
                }
              }}
              className="w-full"
            >
              Sign In as Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Content Studio</h1>
              <p className="text-sm text-muted-foreground">
                Edit content for AIAS and Settler.dev
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url =
                    activeSite === "aias" ? "/" : "/settler";
                  window.open(url, "_blank");
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                title={autoSaveEnabled ? "Disable auto-save" : "Enable auto-save"}
              >
                {autoSaveEnabled ? "Auto-save: ON" : "Auto-save: OFF"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges || saving}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={(!hasChanges && !saving) || saving}
                size="sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {hasChanges ? "Save Changes" : "Saved"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <Tabs value={activeSite} onValueChange={(v) => setActiveSite(v as "aias" | "settler")}>
          <TabsList className="mb-6">
            <TabsTrigger value="aias">AIAS Site</TabsTrigger>
            <TabsTrigger value="settler">Settler.dev</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <TabsContent value="aias" className="space-y-6">
                {aiasContent && (
                  <>
                    <ContentTemplates
                      content={aiasContent}
                      onChange={(content) => {
                        setAiasContent(content as AIASContent);
                        setHasChanges(true);
                      }}
                    />
                    <ContentStudioHero
                      content={aiasContent.hero}
                      onChange={(hero) => {
                        setAiasContent({ ...aiasContent, hero });
                        setHasChanges(true);
                      }}
                      token={token}
                    />
                    <ContentStudioFeatures
                      content={aiasContent.features}
                      onChange={(features) => {
                        setAiasContent({ ...aiasContent, features });
                        setHasChanges(true);
                      }}
                      token={token}
                    />
                    <ContentStudioTestimonials
                      content={aiasContent.testimonials}
                      onChange={(testimonials) => {
                        setAiasContent({ ...aiasContent, testimonials });
                        setHasChanges(true);
                      }}
                      token={token}
                    />
                    <ContentStudioFAQ
                      content={aiasContent.faq}
                      onChange={(faq) => {
                        setAiasContent({ ...aiasContent, faq });
                        setHasChanges(true);
                      }}
                      token={token}
                    />
                  </>
                )}
              </TabsContent>

              <TabsContent value="settler" className="space-y-6">
                {settlerContent && (
                  <>
                    <ContentTemplates
                      content={settlerContent}
                      onChange={(content) => {
                        setSettlerContent(content as SettlerContent);
                        setHasChanges(true);
                      }}
                    />
                    <ContentStudioHero
                      content={settlerContent.hero}
                      onChange={(hero) => {
                        setSettlerContent({ ...settlerContent, hero });
                        setHasChanges(true);
                      }}
                      token={token}
                    />
                    <ContentStudioFeatures
                      content={settlerContent.features}
                      onChange={(features) => {
                        setSettlerContent({ ...settlerContent, features });
                        setHasChanges(true);
                      }}
                      token={token}
                    />
                    {/* Add more Settler-specific editors as needed */}
                  </>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
