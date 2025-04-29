"use client";

import { useState } from "react";
import { KeyRound, Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePrivateKey } from "@/components/private-key-context";
import { useRouter } from "next/navigation";

export function RecoveryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleRecovery } = usePrivateKey();

  const [recoveryKey, setRecoveryKey] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    recoveryKey: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();

  function resetForm() {
    setRecoveryKey("");
    setPassword("");
    setConfirmPassword("");
    setErrors({
      recoveryKey: "",
      password: "",
      confirmPassword: "",
    });
  }

  const validateForm = () => {
    const newErrors = {
      recoveryKey: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!recoveryKey) {
      newErrors.recoveryKey = "Recovery key is required";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const success = await handleRecovery(recoveryKey, password);
    setIsSubmitting(false);
    if (success) {
      resetForm();
      router.replace("/my-files");
    }
  }

  return (
    <div className="container max-w-md py-10 mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Account Recovery</CardTitle>
          <CardDescription>
            Enter your recovery key and set a new password to restore your
            account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="recoveryKey" className="text-sm font-medium">
                Recovery Key
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="recoveryKey"
                  placeholder="Enter your recovery key"
                  className="pl-10"
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value)}
                />
              </div>
              {errors.recoveryKey && (
                <p className="text-sm font-medium text-destructive">
                  {errors.recoveryKey}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Enter the recovery key that was provided to you when you first
                create security key
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a new password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {errors.password && (
                <p className="text-sm font-medium text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm font-medium text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
