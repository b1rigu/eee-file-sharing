"use client";

import { DndContext, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { createContext, useContext, useState } from "react";
import { usePrivateKey } from "./private-key-context";
import { toast } from "sonner";
import { getUserKeyAction } from "@/actions/get-user-key";
import { signMessageWithRSA } from "@/utils/crypto/crypto";
import { changeDataParentAction } from "@/actions/change-data-parent";
import { arrayBufferToBase64 } from "@/utils/utils";
import { useUserData } from "./user-data-context";

type DragAndDropContextType = {
  activeId: string | null;
};

const DragAndDropContext = createContext<DragAndDropContextType | undefined>(
  undefined
);

export function DragAndDropProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { localPrivateKey } = usePrivateKey();
  const { refetchData } = useUserData();

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    // active = currently dragging element
    // over = currently hovered element
    if (!over) return;

    if (active.id === over.id) return;

    const fileOrFolderId = active.id as string;
    let folderToMoveIntoId: string | null = over.id as string;

    if (folderToMoveIntoId === "root-droppable") {
      folderToMoveIntoId = null;
    }

    console.log("fileOrFolderId", fileOrFolderId);
    console.log("folderToMoveIntoId", folderToMoveIntoId);

    if (!localPrivateKey) {
      toast.error("You need to unlock");
      return;
    }

    const userKeyResult = await getUserKeyAction();
    if (!userKeyResult || userKeyResult.serverError || !userKeyResult.data) {
      toast.error("You need to unlock");
      return;
    }

    const signature = await signMessageWithRSA(localPrivateKey);

    const result = await changeDataParentAction({
      newParentId: folderToMoveIntoId,
      dataId: fileOrFolderId,
      signature: arrayBufferToBase64(signature),
    });

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }

    refetchData();
  }

  return (
    <DragAndDropContext.Provider
      value={{
        activeId,
      }}
    >
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {children}
      </DndContext>
    </DragAndDropContext.Provider>
  );
}

export const useDragAndDrop = (): DragAndDropContextType => {
  const context = useContext(DragAndDropContext);
  if (!context) {
    throw new Error("useDragAndDrop must be used within a DragAndDropProvider");
  }
  return context;
};
