"use client";

import { usePrivateKey } from "@/components/private-key-context";
import { useSharedFiles } from "@/components/shared-data-context";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export function SharedFilesRefreshButton() {
  const { localPrivateKey } = usePrivateKey();
  const { refetchData, loading } = useSharedFiles();

  return (
    <Button
      variant={"outline"}
      disabled={loading || !localPrivateKey}
      onClick={refetchData}
    >
      <RefreshCcw className={`${loading ? "animate-spin" : ""}`} />
      Refresh
    </Button>
  );
}
