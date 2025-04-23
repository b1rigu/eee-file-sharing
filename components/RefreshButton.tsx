"use client";

import { RefreshCcw } from "lucide-react";
import { usePrivateKey } from "./private-key-context";
import { Button } from "./ui/button";
import { useUserFiles } from "./user-files-context";

export function RefreshButton() {
  const { localPrivateKey } = usePrivateKey();
  const { refetchFiles, loading } = useUserFiles();

  if (!localPrivateKey) return null;

  return (
    <Button disabled={loading} onClick={refetchFiles}>
      <RefreshCcw className={`${loading ? "animate-spin" : ""}`} />
      Refresh
    </Button>
  );
}
