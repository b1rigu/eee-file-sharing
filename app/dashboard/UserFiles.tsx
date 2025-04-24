"use client";

import { DownloadFileButton } from "./DownloadFileButton";
import { DeleteDataButton } from "./DeleteFileButton";
import { formatFileSize, uint8ArrayToBase64 } from "@/utils/utils";
import { useUserData } from "@/components/user-data-context";
import { usePrivateKey } from "@/components/private-key-context";
import { ChevronRight, Cloud, Folder, Loader2, Lock, MoreVertical, Trash } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useSelectedRows } from "@/components/selected-rows-provider";

export function UserFiles() {
  const { localPrivateKey } = usePrivateKey();
  const { userAvailableData, loading } = useUserData();
  const { dir } = useDirectory();
  const { selectedRows, handleSelect, handleSelectAll } = useSelectedRows();

  return (
    <div className="w-full relative flex flex-col">
      {/* <Button
        variant={"destructive"}
        size={"sm"}
        className="mb-2 w-min self-end"
        disabled={selectedRows.length === 0}
        onClick={handleDeleteSelected}
      >
        <Trash /> Delete selected
      </Button> */}
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/10 dark:bg-white/10 z-50 rounded-md flex items-center backdrop-blur-xs">
          <Loader2 className="animate-spin mx-auto" />
        </div>
      )}
      {!localPrivateKey ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-md bg-muted/20">
          <Lock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Storage is Locked</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-2 mb-4">
            Files and folders are hidden while storage is in locked state. Unlock to view and manage
            your content.
          </p>
          <SecurityToggle />
        </div>
      ) : userAvailableData.length === 0 ? (
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
              <TableRow>
                <TableCell colSpan={5}>
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
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={
                      userAvailableData.length > 0 &&
                      selectedRows.length === userAvailableData.length
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="min-w-48 max-w-96">Name</TableHead>
                <TableHead className="w-36 min-w-36">Size</TableHead>
                <TableHead className="w-36 min-w-36">Type</TableHead>
                <TableHead className="w-36 min-w-36">Uploaded</TableHead>
                <TableHead className="text-right w-36 min-w-36">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userAvailableData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(item.id)}
                      onCheckedChange={() => handleSelect(item.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.type === "folder" && <Folder className="h-4 w-4 text-blue-500" />}
                      {item.type === "folder" ? (
                        <Link
                          href={`/dashboard?dir=${encodeURIComponent(dir + item.id + "/")}`}
                          className="flex items-center hover:underline text-blue-500"
                        >
                          <p>{item.encryptedName}/</p>
                        </Link>
                      ) : (
                        <p>{item.encryptedName}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.type === "folder" ? "--" : formatFileSize(Number(item.encryptedSize!))}
                  </TableCell>
                  <TableCell>{item.type === "folder" ? "Folder" : item.encryptedType!}</TableCell>
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
                          <DeleteDataButton dataId={item.id} />
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
