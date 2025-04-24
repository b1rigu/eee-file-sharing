import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { formatFileSize } from "@/utils/utils";
import { Folder, MoreVertical } from "lucide-react";
import { DeleteDataButton } from "./DeleteFileButton";
import { DownloadFileButton } from "./DownloadFileButton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDirectory } from "@/components/directory-provider";
import { useSelectedRows } from "@/components/selected-rows-provider";
import { dataNodes } from "@/lib/drizzle/schema";
import Link from "next/link";
import { useDraggable, useDroppable } from "@dnd-kit/core";

export function SingleRow({
  item,
  isDraggable,
  isDroppable,
}: {
  item: typeof dataNodes.$inferSelect;
  isDraggable: boolean;
  isDroppable: boolean;
}) {
  const { dir } = useDirectory();
  const { selectedRows, handleSelect } = useSelectedRows();
  const draggable = useDraggable({ id: item.id, disabled: !isDraggable });
  const droppable = useDroppable({ id: item.id, disabled: !isDroppable });
  const style =
    isDraggable && draggable.transform
      ? {
          transform: `translate3d(${draggable.transform.x}px, ${draggable.transform.y}px, 0)`,
        }
      : undefined;
  const isHovered = isDroppable && droppable.isOver;

  return (
    <TableRow
      ref={(node) => {
        if (isDraggable) draggable.setNodeRef(node);
        if (isDroppable) droppable.setNodeRef(node);
      }}
      {...(isDraggable ? draggable.attributes : {})}
      style={style}
      className={isHovered ? "bg-muted" : ""}
    >
      <TableCell>
        <Checkbox
          checked={selectedRows.includes(item.id)}
          onCheckedChange={() => handleSelect(item.id)}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {item.type === "folder" && (
            <>
              <Folder className="h-4 w-4 text-blue-500" />
              <Link
                href={`/dashboard?dir=${encodeURIComponent(
                  dir + item.id + "/"
                )}`}
                className="hover:underline text-blue-500"
              >
                <p>{item.encryptedName}/</p>
              </Link>
            </>
          )}
          {item.type === "file" && <p>{item.encryptedName}</p>}
        </div>
      </TableCell>
      <TableCell {...(isDraggable ? draggable.listeners : {})}>
        {item.type === "folder"
          ? "--"
          : formatFileSize(Number(item.encryptedSize!))}
      </TableCell>
      <TableCell {...(isDraggable ? draggable.listeners : {})}>
        {item.type === "folder" ? "Folder" : item.encryptedType!}
      </TableCell>
      <TableCell {...(isDraggable ? draggable.listeners : {})}>
        {item.createdAt.toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {item.type === "file" && (
              <DropdownMenuItem>
                <DownloadFileButton
                  fileId={item.id}
                  fileName={item.encryptedName}
                  fileSize={Number(item.encryptedSize)}
                  encryptedFileKey={item.encryptedKey}
                />
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <DeleteDataButton dataId={item.id} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
