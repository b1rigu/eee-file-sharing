"use client";

import { usePrivateKey } from "@/components/private-key-context";
import { Cloud, Loader2, Lock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSharedFiles } from "@/components/shared-data-context";
import { SecurityToggle } from "../my-files/SecurityToggle";
import { SharedFilesSingleRow } from "./SharedFilesSingleRow";

export function SharedFiles() {
  const { localPrivateKey } = usePrivateKey();
  const { sharedFiles, loading } = useSharedFiles();

  return (
    <div className="w-full relative flex flex-col">
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
            Files and folders are hidden while storage is in locked state.
            Unlock to view and manage your content.
          </p>
          <SecurityToggle />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-48 max-w-96">Name</TableHead>
                <TableHead className="w-36 min-w-36">Size</TableHead>
                <TableHead className="w-36 min-w-36">Type</TableHead>
                <TableHead className="w-36 min-w-36">Uploaded</TableHead>
                <TableHead className="w-36 min-w-36">Shared by</TableHead>
                <TableHead className="text-right w-36 min-w-36">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sharedFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Cloud className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">
                        No files have been shared to you yet
                      </h3>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sharedFiles.map((sharedFile) => (
                  <SharedFilesSingleRow
                    key={sharedFile.fileId}
                    sharedFile={sharedFile}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
