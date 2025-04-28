import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { formatFileSize, getFileIcon } from "@/utils/utils";
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
import Link from "next/link";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { FilePreviewDialog } from "@/components/FilePreviewDialog";
import { useState } from "react";
import { UserData } from "@/actions/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ShareButton } from "./ShareButton";

export function SingleRow({
  item,
  isDraggable,
  isDroppable,
}: {
  item: UserData;
  isDraggable: boolean;
  isDroppable: boolean;
}) {
  const { dir } = useDirectory();
  const { selectedRows, handleSelect } = useSelectedRows();
  const draggable = useDraggable({ id: item.id, disabled: !isDraggable });
  const droppable = useDroppable({ id: item.id, disabled: !isDroppable });
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const visibleUsers = item.sharedFiles.slice(0, 3);
  const remainingCount = item.sharedFiles.length - visibleUsers.length;

  return (
    <>
      <TableRow
        ref={(node) => {
          if (isDraggable) draggable.setNodeRef(node);
          if (isDroppable) droppable.setNodeRef(node);
        }}
        {...(isDraggable ? draggable.attributes : {})}
        className={`transition-opacity duration-150 ${
          draggable.isDragging ? "bg-muted opacity-50 pointer-events-none" : ""
        } ${droppable.isOver ? "bg-muted" : ""}`}
      >
        <TableCell>
          <Checkbox
            checked={selectedRows.includes(item.id)}
            onCheckedChange={() => handleSelect(item.id)}
          />
        </TableCell>
        <TableCell {...(isDraggable ? draggable.listeners : {})}>
          <ContextMenu>
            <ContextMenuTrigger>
              <div className="flex items-center gap-2">
                {item.type === "folder" && (
                  <>
                    <Folder className="h-4 w-4 text-blue-500" />
                    <Link
                      href={`/my-files?dir=${encodeURIComponent(
                        dir + item.id + "/"
                      )}`}
                      className="hover:underline text-blue-500"
                    >
                      <p>{item.encryptedName}/</p>
                    </Link>
                  </>
                )}
                {item.type === "file" && (
                  <>
                    {getFileIcon(item.encryptedType!, 4)}
                    <p
                      onClick={() => setFilePreviewOpen(true)}
                      className="hover:underline text-blue-500 cursor-pointer"
                    >
                      {item.encryptedName}
                    </p>
                  </>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {item.type === "file" && (
                <DownloadFileButton
                  fileId={item.id}
                  fileName={item.encryptedName}
                  fileSize={Number(item.encryptedSize)}
                  encryptedFileKey={item.encryptedKey}
                  contextMenu
                />
              )}
              {item.type === "file" && (
                <ContextMenuItem onSelect={() => setShareDialogOpen(true)}>
                  Share
                </ContextMenuItem>
              )}
              <DeleteDataButton dataId={item.id} contextMenu />
            </ContextMenuContent>
          </ContextMenu>
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
        <TableCell>
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {visibleUsers.map((user) => (
                <Avatar
                  key={user.id}
                  className="border-2 border-background h-8 w-8"
                >
                  <AvatarImage
                    src={user.receiver.image ?? undefined}
                    alt={user.receiver.email}
                  />
                  <AvatarFallback>{user.receiver.email}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            {remainingCount > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                +{remainingCount} more
              </span>
            )}
          </div>
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
                <DownloadFileButton
                  fileId={item.id}
                  fileName={item.encryptedName}
                  fileSize={Number(item.encryptedSize)}
                  encryptedFileKey={item.encryptedKey}
                />
              )}
              {item.type === "file" && (
                <DropdownMenuItem onSelect={() => setShareDialogOpen(true)}>
                  Share
                </DropdownMenuItem>
              )}
              <DeleteDataButton dataId={item.id} />
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      {item.type === "file" && (
        <ShareButton
          item={item}
          shareDialogOpen={shareDialogOpen}
          setShareDialogOpen={(open) => setShareDialogOpen(open)}
        />
      )}
      {item.type === "file" && (
        <FilePreviewDialog
          isOpen={filePreviewOpen}
          handleClose={() => setFilePreviewOpen(false)}
          uploadedFile={{
            fileName: item.encryptedName,
            fileType: item.encryptedType!,
            fileSize: Number(item.encryptedSize),
            fileId: item.id,
            iv: item.iv,
            encryptedKey: item.encryptedKey,
          }}
        />
      )}
    </>
  );
}
