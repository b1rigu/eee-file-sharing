"use client";

import { usePrivateKey } from "@/components/private-key-context";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/components/user-data-context";
import { RefreshCcw } from "lucide-react";

export function RefreshButton() {
  const { localPrivateKey } = usePrivateKey();
  const { refetchData, loading } = useUserData();

  return (
    <Button variant={"outline"} disabled={loading || !localPrivateKey} onClick={refetchData}>
      <RefreshCcw className={`${loading ? "animate-spin" : ""}`} />
      Refresh
    </Button>
  );
}
