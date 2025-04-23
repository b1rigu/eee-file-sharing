"use client";

import { DownloadFileButton } from "./DownloadFileButton";
import { DeleteFileButton } from "./DeleteFileButton";
import { formatFileSize } from "@/utils/utils";
import { useUserData } from "@/components/user-data-context";
import { usePrivateKey } from "@/components/private-key-context";
import { ChevronRight, Cloud, Folder, Lock, MoreVertical } from "lucide-react";
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
import { NewFolderButton } from "./NewFolderButton";
import Link from "next/link";
import { useDirectory } from "@/components/directory-provider";

export function UserFiles() {
  const { localPrivateKey } = usePrivateKey();
  const { userAvailableData, loading } = useUserData();
  const { dir } = useDirectory();

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
      ) : userAvailableData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Cloud className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">This folder is empty</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload files or create folders to organize your content
          </p>
          <div className="flex gap-2">
            <NewFolderButton />
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
                <TableHead>Type</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userAvailableData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center">
                      {item.type === "folder" && (
                        <Folder className="h-4 w-4 ml-2" />
                      )}
                      {item.type === "folder" ? (
                        <Link
                          href={`/dashboard?dir=${encodeURIComponent(
                            dir + item.id + "/"
                          )}`}
                          className="flex items-center hover:underline text-blue-600"
                        >
                          <p className="ml-2 font-semibold">
                            {item.encryptedName}/
                          </p>
                        </Link>
                      ) : (
                        <p className="ml-2 font-semibold">
                          {item.encryptedName}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.type === "folder"
                      ? "--"
                      : formatFileSize(Number(item.encryptedSize!))}
                  </TableCell>
                  <TableCell>
                    {item.type === "folder" ? "--" : item.encryptedType!}
                  </TableCell>
                  <TableCell>{item.createdAt.toLocaleString()}</TableCell>
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
                          <DeleteFileButton dataId={item.id} />
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
