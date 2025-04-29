"use client";

import { useState } from "react";
import { Check, Copy, Key } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePrivateKey } from "./private-key-context";

export function RecoveryKeyDialog() {
  const [copied, setCopied] = useState(false);
  const { clearRecoveryKey, recoveryKey } = usePrivateKey();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recoveryKey ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  function handleClose() {
    clearRecoveryKey();
  }

  if (!recoveryKey) return null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-amber-500" />
            Your Recovery Key
          </DialogTitle>
          <DialogDescription>
            This recovery key is the only way to recover your encrypted private
            key if you forget your password. Store it in a secure location.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-md bg-muted p-4 mb-4">
            <p className="text-sm font-medium text-amber-600 mb-2">
              Important:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Save this key somewhere safe but accessible</li>
              <li>
                • Without this key, your encrypted data cannot be recovered
              </li>
              <li>• This key is case-sensitive</li>
              <li>
                • This key will not be shown again after you close this dialog
              </li>
            </ul>
          </div>
          <div className="flex justify-center">
            <div className="font-mono text-base p-4 bg-background rounded-md border text-center tracking-wider">
              {recoveryKey}
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button variant="outline" onClick={() => handleClose()}>
            I've saved this key
          </Button>
          <Button onClick={copyToClipboard} className="mb-2 sm:mb-0">
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy key
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
