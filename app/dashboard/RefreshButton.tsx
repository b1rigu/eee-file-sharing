"use client";

import { usePrivateKey } from "@/components/private-key-context";
import { Button } from "@/components/ui/button";
import { useUserFiles } from "@/components/user-files-context";
import { RefreshCcw } from "lucide-react";

export function RefreshButton() {
  const { localPrivateKey } = usePrivateKey();
  const { refetchFiles, loading } = useUserFiles();

  if (!localPrivateKey) return null;

  return (
    <Button variant={"outline"} disabled={loading} onClick={refetchFiles}>
      <RefreshCcw className={`${loading ? "animate-spin" : ""}`} />
      Refresh
    </Button>
  );
}
