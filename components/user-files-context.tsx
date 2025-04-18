"use client";

import { fileAccess, uploadedFiles } from "@/lib/drizzle/schema";
import {
  importDecryptPrivateKey,
  importPrivateKey,
  signMessage,
} from "@/utils/crypto";
import { base64ToUint8Array, uint8ArrayToBase64 } from "@/utils/utils";
import { createContext, useContext, useEffect, useState } from "react";
import { usePrivateKey } from "./private-key-context";
import { getUserFilesAction } from "@/actions/get-user-files";
import { SIGN_TEST_MESSAGE } from "@/app.config";
import { toast } from "sonner";

type UserFilesContextType = {
  userAvailableFiles: {
    file_access: typeof fileAccess.$inferSelect;
    uploaded_files: typeof uploadedFiles.$inferSelect | null;
  }[];
  refetchFiles: () => void;
  loading: boolean;
};

const UserFilesContext = createContext<UserFilesContextType | undefined>(
  undefined
);

export const UserFilesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userAvailableFiles, setUserAvailableFiles] = useState<
    {
      file_access: typeof fileAccess.$inferSelect;
      uploaded_files: typeof uploadedFiles.$inferSelect | null;
    }[]
  >([]);
  const { localPrivateKey } = usePrivateKey();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserFiles();
  }, [localPrivateKey]);

  async function getUserFiles() {
    if (!localPrivateKey) {
      return;
    }

    setLoading(true);
    const importedPrivateKey = await importPrivateKey(localPrivateKey);
    const signature = await signMessage(importedPrivateKey, SIGN_TEST_MESSAGE);

    const userFilesResult = await getUserFilesAction({
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
      signatureMessage: SIGN_TEST_MESSAGE,
    });
    setLoading(false);
    if (userFilesResult?.serverError) {
      toast.error(userFilesResult.serverError);
      return;
    }

    if (!userFilesResult?.data) {
      return;
    }

    const mappedUserFiles = await Promise.all(
      userFilesResult.data.map(async (item) => {
        if (item.uploaded_files) {
          return {
            ...item,
            uploaded_files: {
              ...item.uploaded_files,
              fileName: await decryptText(
                item.uploaded_files.fileName,
                item.file_access.encryptedFileKey,
                item.file_access.iv
              ),
              fileType: await decryptText(
                item.uploaded_files.fileType,
                item.file_access.encryptedFileKey,
                item.file_access.iv
              ),
              fileSize: await decryptText(
                item.uploaded_files.fileSize,
                item.file_access.encryptedFileKey,
                item.file_access.iv
              ),
            },
          };
        }
        return item;
      })
    );

    setUserAvailableFiles(mappedUserFiles);
  }

  async function decryptText(
    encryptedText: string,
    encryptedFileKey: string,
    iv: string
  ) {
    if (!localPrivateKey) {
      return "";
    }

    try {
      const importedDecryptPrivateKey = await importDecryptPrivateKey(
        localPrivateKey
      );

      const rawAesKey = await crypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
        },
        importedDecryptPrivateKey,
        base64ToUint8Array(encryptedFileKey)
      );

      const aesKey = await crypto.subtle.importKey(
        "raw",
        rawAesKey,
        {
          name: "AES-GCM",
        },
        false,
        ["decrypt"]
      );

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: base64ToUint8Array(iv), // Uint8Array (same IV you used for encryption)
        },
        aesKey,
        base64ToUint8Array(encryptedText)
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error(error);
      return "";
    }
  }

  async function refetchFiles() {
    setLoading(true);
    await getUserFiles();
    setLoading(false);
  }

  return (
    <UserFilesContext.Provider
      value={{
        userAvailableFiles,
        refetchFiles,
        loading,
      }}
    >
      {children}
    </UserFilesContext.Provider>
  );
};

export const useUserFiles = (): UserFilesContextType => {
  const context = useContext(UserFilesContext);
  if (!context) {
    throw new Error("useUserFiles must be used within a UserFilesProvider");
  }
  return context;
};
