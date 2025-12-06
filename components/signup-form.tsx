"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signUpUser } from "@/lib/actions/auth-actions";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { validateEmail, validatePassword } from "@/lib/utils/form-validation";
import { getUserFriendlyError } from "@/lib/utils/error-messages";

/**
 * Sign-Up Form Component
 * 
 * Client Component that uses Server Action for user registration.
 * Demonstrates the complete data flow:
 * User Sign-up (Vercel Form) → Next.js Server Action → Supabase profiles table (RLS Check) → activity_log entry
 */

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation with user-friendly messages
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      toast({
        title: "Invalid Email",
        description: emailValidation.error,
        variant: "destructive",
      });
      return;
    }

    const passwordValidation = validatePassword(password, {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
    });
    if (!passwordValidation.valid) {
      toast({
        title: "Invalid Password",
        description: passwordValidation.error,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUpUser(email, password, displayName || undefined);

      if (result.success && result.data) {
        toast({
          title: "Account Created!",
          description: "Your account has been created successfully. Redirecting...",
          variant: "default",
        });

        // Redirect to account page after successful sign-up
        setTimeout(() => {
          router.push("/account");
        }, 1500);
      } else {
        // Use user-friendly error messages
        const friendlyError = getUserFriendlyError(
          result.error || "Sign-up failed",
          { action: "create your account" }
        );
        toast({
          title: friendlyError.title,
          description: friendlyError.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      const friendlyError = getUserFriendlyError(
        error instanceof Error ? error : String(error),
        { action: "create your account" }
      );
      toast({
        title: friendlyError.title,
        description: friendlyError.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Create Account
        </CardTitle>
        <CardDescription>
          Join our community and start building with custom AI platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name (Optional)</Label>
            <Input
              id="display-name"
              type="text"
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              aria-describedby="password-help"
            />
            <p id="password-help" className="text-xs text-muted-foreground">
              Must be at least 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
