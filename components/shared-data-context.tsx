"use client";

import { uint8ArrayToBase64 } from "@/utils/utils";
import { createContext, useContext, useEffect, useState } from "react";
import { usePrivateKey } from "./private-key-context";
import { toast } from "sonner";
import {
  decryptTextWithPrivateKey,
  signMessageWithRSA,
} from "@/utils/crypto/crypto";
import { SharedFileType } from "@/actions/types";
import { getSharedFilesAction } from "@/actions/get-shared-files";

type SharedFilesContextType = {
  sharedFiles: SharedFileType[];
  refetchData: () => void;
  loading: boolean;
};

const SharedFilesContext = createContext<SharedFilesContextType | undefined>(
  undefined
);

export const SharedFilesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sharedFiles, setSharedFiles] = useState<SharedFileType[]>([]);
  const { localPrivateKey } = usePrivateKey();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getData();
  }, [localPrivateKey]);

  async function getData() {
    if (!localPrivateKey) {
      setSharedFiles([]);
      return;
    }

    setLoading(true);

    const signature = await signMessageWithRSA(localPrivateKey);

    const sharedFilesResult = await getSharedFilesAction({
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
    });
    setLoading(false);
    if (sharedFilesResult?.serverError) {
      toast.error(sharedFilesResult.serverError);
      return;
    }

    if (!sharedFilesResult?.data) {
      return;
    }

    const mappedData = await Promise.all(
      sharedFilesResult.data.map(async (item) => {
        return {
          ...item,
          encryptedName: await decryptTextWithPrivateKey(
            item.encryptedName,
            item.encryptedKey,
            item.iv,
            localPrivateKey
          ),
          encryptedType: await decryptTextWithPrivateKey(
            item.encryptedType,
            item.encryptedKey,
            item.iv,
            localPrivateKey
          ),
          encryptedSize: await decryptTextWithPrivateKey(
            item.encryptedSize,
            item.encryptedKey,
            item.iv,
            localPrivateKey
          ),
        };
      })
    );

    setSharedFiles(mappedData);
  }

  async function refetchData() {
    setLoading(true);
    await getData();
    setLoading(false);
  }

  return (
    <SharedFilesContext.Provider
      value={{
        sharedFiles,
        refetchData,
        loading,
      }}
    >
      {children}
    </SharedFilesContext.Provider>
  );
};

export const useSharedFiles = (): SharedFilesContextType => {
  const context = useContext(SharedFilesContext);
  if (!context) {
    throw new Error("useSharedFiles must be used within a SharedFilesProvider");
  }
  return context;
};
