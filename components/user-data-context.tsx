"use client";

import { uint8ArrayToBase64 } from "@/utils/utils";
import { createContext, useContext, useEffect, useState } from "react";
import { usePrivateKey } from "./private-key-context";
import { getUserDataAction } from "@/actions/get-user-data";
import { toast } from "sonner";
import {
  decryptTextWithPrivateKey,
  signMessageWithRSA,
} from "@/utils/crypto/crypto";
import { useDirectory } from "./directory-provider";
import { useRouter } from "next/navigation";
import { UserData } from "@/actions/types";

type UserDataContextType = {
  userAvailableData: UserData[];
  refetchData: () => void;
  loading: boolean;
};

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

export const UserDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userAvailableData, setUserAvailableData] = useState<UserData[]>([]);
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
      router.replace("/my-files");
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
            encryptedName: await decryptTextWithPrivateKey(
              item.encryptedName,
              item.encryptedKey,
              item.iv,
              localPrivateKey
            ),
            encryptedType: await decryptTextWithPrivateKey(
              item.encryptedType!,
              item.encryptedKey,
              item.iv,
              localPrivateKey
            ),
            encryptedSize: await decryptTextWithPrivateKey(
              item.encryptedSize!,
              item.encryptedKey,
              item.iv,
              localPrivateKey
            ),
          };
        }

        return {
          ...item,
          encryptedName: await decryptTextWithPrivateKey(
            item.encryptedName,
            item.encryptedKey,
            item.iv,
            localPrivateKey
          ),
        };
      })
    );

    setUserAvailableData(mappedUserData);
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
