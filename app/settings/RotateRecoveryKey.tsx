"use client";

import { useState } from "react";
import { Key, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePrivateKey } from "@/components/private-key-context";

export function RotateRecoveryKey() {
  const [loading, setLoading] = useState(false);
  const { handleRotateRecoveryKey, localPrivateKey } = usePrivateKey();

  async function handleRotate() {
    setLoading(true);
    await handleRotateRecoveryKey();
    setLoading(false);
  }

  return (
    <Card
      className={`${localPrivateKey ? "" : "opacity-50 pointer-events-none"}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Recovery Key
        </CardTitle>
        <CardDescription>
          Your recovery key is used to decrypt your private key if you forget
          your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-amber-50 border border-amber-200 p-4 mb-6">
          <div className="flex gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">
                Important
              </p>
              <p className="text-sm text-amber-700">
                Rotating your recovery key will invalidate your previous key.
                You will need to securely store your new key. Without a valid
                recovery key, you will permanently lose access to your encrypted
                data if you forget your password.
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" onClick={handleRotate} disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          Rotate Recovery Key
        </Button>
      </CardContent>
    </Card>
  );
}
