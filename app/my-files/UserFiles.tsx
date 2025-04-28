"use client";

import { useUserData } from "@/components/user-data-context";
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
import { SecurityToggle } from "./SecurityToggle";
import { UploadFilesButton } from "./UploadFilesButton";
import { NewFolderButton } from "./NewFolderButton";
import { Checkbox } from "@/components/ui/checkbox";
import { useSelectedRows } from "@/components/selected-rows-provider";
import { SingleRow } from "./SingleRow";
import { BackFolderButton } from "./BackFolderButton";
import { useDragAndDrop } from "@/components/drag-and-drop-provider";
import { DragOverlay } from "@dnd-kit/core";
import { restrictToWindowEdges, snapCenterToCursor } from "@dnd-kit/modifiers";
import { getFileIcon } from "@/utils/utils";

export function UserFiles() {
  const { localPrivateKey } = usePrivateKey();
  const { userAvailableData, loading } = useUserData();
  const { selectedRows, handleSelectAll } = useSelectedRows();
  const { activeId } = useDragAndDrop();
  const activeItem = userAvailableData.find((item) => item.id === activeId);

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
                <TableHead className="w-[30px] min-w-[30px]">
                  <Checkbox
                    disabled={userAvailableData.length === 0}
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
                <TableHead className="w-36 min-w-36">Shared</TableHead>
                <TableHead className="text-right w-36 min-w-36">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <BackFolderButton />
              {userAvailableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Cloud className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">
                        This folder is empty
                      </h3>
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
              ) : (
                userAvailableData.map((item) => (
                  <SingleRow
                    key={item.id}
                    item={item}
                    isDraggable
                    isDroppable={item.type === "folder"}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <DragOverlay modifiers={[snapCenterToCursor, restrictToWindowEdges]}>
        {activeItem ? (
          <div className="border drop-shadow-md px-8 py-2 text-nowrap bg-background rounded-2xl w-min cursor-grabbing flex items-center gap-2">
            {getFileIcon(activeItem.encryptedType!, 4)}
            <p>{activeItem.encryptedName}</p>
          </div>
        ) : null}
      </DragOverlay>
    </div>
  );
}
