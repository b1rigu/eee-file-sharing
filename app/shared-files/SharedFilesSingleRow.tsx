import { TableRow, TableCell } from "@/components/ui/table";
import { formatFileSize, getFileIcon } from "@/utils/utils";
import { FilePreviewDialog } from "@/components/FilePreviewDialog";
import { useState } from "react";
import { SharedFileType } from "@/actions/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { DownloadFileButton } from "../my-files/DownloadFileButton";

export function SharedFilesSingleRow({
  sharedFile,
}: {
  sharedFile: SharedFileType;
}) {
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-2">
            {getFileIcon(sharedFile.encryptedType, 4)}
            <p
              onClick={() => setFilePreviewOpen(true)}
              className="hover:underline text-blue-500 cursor-pointer"
            >
              {sharedFile.encryptedName}
            </p>
          </div>
        </TableCell>
        <TableCell>
          {formatFileSize(Number(sharedFile.encryptedSize))}
        </TableCell>
        <TableCell>{sharedFile.encryptedType}</TableCell>
        <TableCell>{sharedFile.createdAt.toLocaleString()}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Avatar className="border-2 border-background h-8 w-8">
              <AvatarImage
                src={sharedFile.sender.image ?? undefined}
                alt={sharedFile.sender.email}
              />
              <AvatarFallback>{sharedFile.sender.email}</AvatarFallback>
            </Avatar>
            <p>{sharedFile.sender.email}</p>
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
              <DownloadFileButton
                fileId={sharedFile.fileId}
                fileName={sharedFile.encryptedName}
                fileSize={Number(sharedFile.encryptedSize)}
                encryptedFileKey={sharedFile.encryptedKey}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      <FilePreviewDialog
        isOpen={filePreviewOpen}
        handleClose={() => setFilePreviewOpen(false)}
        uploadedFile={{
          fileName: sharedFile.encryptedName,
          fileType: sharedFile.encryptedType,
          fileSize: Number(sharedFile.encryptedSize),
          fileId: sharedFile.fileId,
          iv: sharedFile.iv,
          encryptedKey: sharedFile.encryptedKey,
        }}
      />
    </>
  );
}
