"use client";

import { useDirectory } from "@/components/directory-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { TableRow, TableCell } from "@/components/ui/table";
import { useDroppable } from "@dnd-kit/core";
import { Folder } from "lucide-react";
import Link from "next/link";

export function BackFolderButton() {
  const { segments } = useDirectory();
  const { setNodeRef, isOver } = useDroppable({
    id: segments.length > 1 ? segments[segments.length - 2] : "root-droppable",
    disabled: segments.length === 0,
  });

  return (
    <>
      {segments.length > 0 && (
        <TableRow ref={setNodeRef} className={isOver ? "bg-muted" : ""}>
          <TableCell>
            <Checkbox disabled checked={false} />
          </TableCell>
          <TableCell colSpan={5} className="font-medium py-3.5">
            <Link
              href={`/dashboard?dir=${encodeURIComponent(
                segments.slice(0, segments.length - 1).join("/") + "/"
              )}`}
              className="flex items-center hover:underline text-blue-500 gap-2"
            >
              <Folder className="h-4 w-4 text-blue-500" />
              .. (parent)
            </Link>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
