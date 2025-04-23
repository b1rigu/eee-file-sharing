"use client";

import { DecryptFile } from "./DecryptFile";
import { DeleteFileButton } from "./DeleteFileButton";
import { formatFileSize } from "@/utils/utils";
import { useUserFiles } from "@/components/user-files-context";
import { usePrivateKey } from "@/components/private-key-context";
import { Cloud, Folder, Lock, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SecurityToggle } from "./SecurityToggle";
import { UploadFilesButton } from "./UploadFilesButton";

export function UserFiles() {
  const { localPrivateKey } = usePrivateKey();
  const { userAvailableFiles, loading } = useUserFiles();

  return (
    <div className="w-full">
      {!localPrivateKey ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-md bg-muted/20">
          <Lock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Storage is Locked</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-2 mb-4">
            Files and folders are hidden while storage is in locked state.
            Unlock to view and manage your content.
          </p>
          <SecurityToggle />
        </div>
      ) : userAvailableFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Cloud className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">This folder is empty</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload files or create folders to organize your content
          </p>
          <div className="flex gap-2">
            {/* <Button variant="outline">
                <Folder className="mr-2 h-4 w-4" />
                New Folder
              </Button> */}
            <UploadFilesButton />
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userAvailableFiles.map((availableFile) => (
                <TableRow key={availableFile.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <span className="ml-2">
                        {availableFile.encryptedFileName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatFileSize(Number(availableFile.encryptedFileSize))}
                  </TableCell>
                  <TableCell>
                    {availableFile.createdAt.toLocaleDateString()}
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
                        {/* {!file.isFolder && (
                          <DropdownMenuItem>Download</DropdownMenuItem>
                        )} */}
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        {/* {!file.isFolder && (
                          <DropdownMenuItem>Share</DropdownMenuItem>
                        )} */}
                        <DropdownMenuItem>
                          <DeleteFileButton fileId={availableFile.id} />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
