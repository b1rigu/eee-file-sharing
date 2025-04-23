"use client";

import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePrivateKey } from "@/components/private-key-context";

export function HeaderBadge() {
  const { localPrivateKey } = usePrivateKey();

  return (
    <>
      {!localPrivateKey && (
        <Badge variant="destructive" className="gap-1">
          <Lock className="h-3 w-3" />
          Locked
        </Badge>
      )}
    </>
  );
}
