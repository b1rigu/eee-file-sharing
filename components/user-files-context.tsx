"use client";

import { uploadedFiles } from "@/lib/drizzle/schema";
import {
  arrayBufferToBase64,
  base64ToUint8Array,
  uint8ArrayToBase64,
} from "@/utils/utils";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePrivateKey } from "./private-key-context";
import { getUserFilesAction } from "@/actions/get-user-files";
import { toast } from "sonner";
import { signMessageWithRSA } from "@/utils/crypto/crypto";
import {
  decryptBufferWithAESGCM,
  importAESKeyForDecrypt,
} from "@/utils/crypto/aes-utils";
import { decryptBufferWithRSAPrivateKey } from "@/utils/crypto/rsa-utils";

type UserFilesContextType = {
  userAvailableFiles: (typeof uploadedFiles.$inferSelect)[];
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
    (typeof uploadedFiles.$inferSelect)[]
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

    const signature = await signMessageWithRSA(localPrivateKey);

    const userFilesResult = await getUserFilesAction({
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
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
        return {
          ...item,
          encryptedFileName: await decryptText(
            item.encryptedFileName,
            item.encryptedFileKey,
            item.iv
          ),
          encryptedFileType: await decryptText(
            item.encryptedFileType,
            item.encryptedFileKey,
            item.iv
          ),
          encryptedFileSize: await decryptText(
            item.encryptedFileSize,
            item.encryptedFileKey,
            item.iv
          ),
        };
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
      const ivBytes = base64ToUint8Array(iv);
      const encryptedBytes = base64ToUint8Array(encryptedText);
      const decryptedAesKey = await decryptBufferWithRSAPrivateKey(
        base64ToUint8Array(encryptedFileKey),
        localPrivateKey
      );
      const aesKey = await importAESKeyForDecrypt(
        arrayBufferToBase64(decryptedAesKey)
      );
      const decryptedBuffer = await decryptBufferWithAESGCM(
        ivBytes,
        aesKey,
        encryptedBytes
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
