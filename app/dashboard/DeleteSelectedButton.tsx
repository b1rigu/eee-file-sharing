"use client";

import { useSelectedRows } from "@/components/selected-rows-provider";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

export function DeleteSelectedButton() {
  const { selectedRows, handleDeleteSelected } = useSelectedRows();

  return (
    <Button
      variant={selectedRows.length === 0 ? "secondary" : "destructive"}
      onClick={handleDeleteSelected}
      disabled={selectedRows.length === 0}
    >
      <Trash />
      Delete {selectedRows.length > 1 ? `${selectedRows.length} uploads` : "upload"}
    </Button>
  );
}
