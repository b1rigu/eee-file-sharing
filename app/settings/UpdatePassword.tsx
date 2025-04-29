"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { usePrivateKey } from "@/components/private-key-context";

export function UpdatePassword() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const { localPrivateKey, handleResetPassword } = usePrivateKey();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (passwordData.newPassword.length < 8) {
      toast.error("Password should be longer than 8 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    await handleResetPassword(passwordData.newPassword);
    setIsChangingPassword(false);
    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    });
  }

  return (
    <Card
      className={`${localPrivateKey ? "" : "opacity-50 pointer-events-none"}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Password
        </CardTitle>
        <CardDescription>
          Change your account password. We recommend using a strong, unique
          password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword && <Loader2 className="animate-spin" />}
              {isChangingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
