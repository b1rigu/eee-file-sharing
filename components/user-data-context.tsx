"use client";

import { dataNodes } from "@/lib/drizzle/schema";
import { arrayBufferToBase64, base64ToUint8Array, uint8ArrayToBase64 } from "@/utils/utils";
import { createContext, useContext, useEffect, useState } from "react";
import { usePrivateKey } from "./private-key-context";
import { getUserDataAction } from "@/actions/get-user-data";
import { toast } from "sonner";
import { signMessageWithRSA } from "@/utils/crypto/crypto";
import { decryptBufferWithAESGCM, importAESKeyForDecrypt } from "@/utils/crypto/aes-utils";
import { decryptBufferWithRSAPrivateKey } from "@/utils/crypto/rsa-utils";
import { useDirectory } from "./directory-provider";
import { useRouter } from "next/navigation";

type UserDataContextType = {
  userAvailableData: (typeof dataNodes.$inferSelect)[];
  refetchData: () => void;
  loading: boolean;
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [userAvailableData, setUserAvailableData] = useState<(typeof dataNodes.$inferSelect)[]>([]);
  const { localPrivateKey } = usePrivateKey();
  const [loading, setLoading] = useState(false);
  const { currentDir } = useDirectory();
  const router = useRouter();

  useEffect(() => {
    getUserData();
  }, [localPrivateKey, currentDir]);

  async function getUserData() {
    if (!localPrivateKey) {
      setUserAvailableData([]);
      return;
    }

    setLoading(true);

    const signature = await signMessageWithRSA(localPrivateKey);

    const userDataResult = await getUserDataAction({
      parentId: currentDir ?? undefined,
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
    });
    setLoading(false);
    if (userDataResult?.serverError) {
      toast.error(userDataResult.serverError);
      router.replace("/dashboard");
      return;
    }

    if (!userDataResult?.data) {
      return;
    }

    const mappedUserData = await Promise.all(
      userDataResult.data.map(async (item) => {
        if (item.type === "file") {
          return {
            ...item,
            encryptedName: await decryptText(item.encryptedName, item.encryptedKey, item.iv),
            encryptedType: await decryptText(item.encryptedType!, item.encryptedKey, item.iv),
            encryptedSize: await decryptText(item.encryptedSize!, item.encryptedKey, item.iv),
          };
        }

        return {
          ...item,
          encryptedName: await decryptText(item.encryptedName, item.encryptedKey, item.iv),
        };
      })
    );

    setUserAvailableData(mappedUserData);
  }

  async function decryptText(encryptedText: string, encryptedFileKey: string, iv: string) {
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
      const aesKey = await importAESKeyForDecrypt(arrayBufferToBase64(decryptedAesKey));
      const decryptedBuffer = await decryptBufferWithAESGCM(ivBytes, aesKey, encryptedBytes);
      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error(error);
      return "";
    }
  }

  async function refetchData() {
    setLoading(true);
    await getUserData();
    setLoading(false);
  }

  return (
    <UserDataContext.Provider
      value={{
        userAvailableData,
        refetchData,
        loading,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};
