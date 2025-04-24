// context/SelectedRowsContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useUserData } from "./user-data-context";
import { deleteUploadedDataAction } from "@/actions/delete-uploaded-data";
import { signMessageWithRSA } from "@/utils/crypto/crypto";
import { uint8ArrayToBase64 } from "@/utils/utils";
import { toast } from "sonner";
import { usePrivateKey } from "./private-key-context";

type SelectedRowsContextType = {
  selectedRows: string[];
  handleSelect: (id: string) => void;
  handleSelectAll: () => void;
  handleDeleteSelected: () => Promise<void>;
};

const SelectedRowsContext = createContext<SelectedRowsContextType | undefined>(undefined);

export const SelectedRowsProvider = ({ children }: { children: ReactNode }) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { localPrivateKey } = usePrivateKey();
  const { userAvailableData, refetchData } = useUserData();

  const handleSelect = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === userAvailableData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(userAvailableData.map((item) => item.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return;

    if (!localPrivateKey) {
      toast.error("You need to unlock");
      return;
    }

    if (!confirm("Are you sure you want to delete?. This is permanent.")) {
      return;
    }

    const signature = await signMessageWithRSA(localPrivateKey);

    const result = await deleteUploadedDataAction({
      dataIds: selectedRows,
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
    });

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }

    toast.success("Deleted");
    refetchData();
    setSelectedRows([]);
  };

  return (
    <SelectedRowsContext.Provider
      value={{ selectedRows, handleSelect, handleSelectAll, handleDeleteSelected }}
    >
      {children}
    </SelectedRowsContext.Provider>
  );
};

export const useSelectedRows = (): SelectedRowsContextType => {
  const context = useContext(SelectedRowsContext);
  if (!context) {
    throw new Error("useSelectedRows must be used within a SelectedRowsProvider");
  }
  return context;
};
