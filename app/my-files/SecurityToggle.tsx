"use client";

import { usePrivateKey } from "@/components/private-key-context";
import { Button } from "@/components/ui/button";
import { Unlock, Lock, Loader2 } from "lucide-react";

export function SecurityToggle() {
  const { localPrivateKey, handleEnable, lock, loading } = usePrivateKey();

  return (
    <Button
      variant={!localPrivateKey ? "destructive" : "outline"}
      onClick={localPrivateKey ? lock : handleEnable}
    >
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : !localPrivateKey ? (
        <>
          <Unlock className="h-4 w-4" />
          Unlock
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" />
          Lock
        </>
      )}
    </Button>
  );
}
