"use client";

import { enableSecurityAction } from "@/actions/enable-security";
import { getUserKeyAction } from "@/actions/get-user-key";
import { userKeys } from "@/lib/drizzle/schema";
import {
  decryptPrivateKeyWithPassword,
  encryptPrivateKeyWithPassword,
} from "@/utils/crypto/crypto";
import {
  exportRSAPrivateKey,
  exportRSAPublicKey,
  generateRSAKeyPair,
} from "@/utils/crypto/rsa-utils";
import { arrayBufferToBase64 } from "@/utils/utils";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { UnlockDialog } from "./UnlockDialog";

type PrivateKeyContextType = {
  localPrivateKey: string | null;
  lock: () => void;
  handleEnable: () => void;
  loading: boolean;
};

const PrivateKeyContext = createContext<PrivateKeyContextType | undefined>(
  undefined
);

export const PrivateKeyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [localPrivateKey, setPrivateLocalKeyState] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [userKey, setUserKey] = useState<typeof userKeys.$inferSelect | null>(
    null
  );

  function lock() {
    setPrivateLocalKeyState(null);
    setUserKey(null);
  }

  async function handleSubmit(password: string) {
    if (isCreatingNew) {
      await handleNewSecurity(password);
    } else {
      await requestPassword(password);
    }
  }

  async function handleEnable() {
    const userKeyResult = await getUserKeyAction();
    if (userKeyResult?.serverError) {
      toast.error(userKeyResult.serverError);
      return;
    }

    if (userKeyResult?.data) {
      setUserKey(userKeyResult.data);
      setIsCreatingNew(false);
      setIsDialogOpen(true);
    } else {
      setIsCreatingNew(true);
      setIsDialogOpen(true);
    }
  }

  async function requestPassword(password: string) {
    if (!userKey) return;
    setLoading(true);

    try {
      const decryptedPrivatekey = await decryptPrivateKeyWithPassword(
        userKey.encryptedPrivateKey,
        password,
        userKey.salt,
        userKey.iv
      );
      setPrivateLocalKeyState(
        arrayBufferToBase64(await exportRSAPrivateKey(decryptedPrivatekey))
      );
      setIsDialogOpen(false);
      setUserKey(null);
    } catch (error) {
      toast.error("Incorrect password");
    } finally {
      setLoading(false);
    }
  }

  async function handleNewSecurity(password: string) {
    setLoading(true);

    const keyPair = await generateRSAKeyPair();
    const publicKey = await exportRSAPublicKey(keyPair.publicKey);
    const publicKeyString = arrayBufferToBase64(publicKey);
    const privateKey = await exportRSAPrivateKey(keyPair.privateKey);
    const privateKeyString = arrayBufferToBase64(privateKey);

    const encryptedPrivateKeyData = await encryptPrivateKeyWithPassword(
      keyPair.privateKey,
      password
    );
    const result = await enableSecurityAction({
      publicKey: publicKeyString,
      encryptedPrivateKey: encryptedPrivateKeyData.encryptedPrivateKey,
      salt: encryptedPrivateKeyData.salt,
      iv: encryptedPrivateKeyData.iv,
    });

    if (result?.serverError) {
      toast.error(result.serverError);
      setLoading(false);
      return;
    }

    setLoading(false);
    setPrivateLocalKeyState(privateKeyString);
    setIsDialogOpen(false);
  }

  return (
    <>
      <PrivateKeyContext.Provider
        value={{ localPrivateKey, lock, handleEnable, loading }}
      >
        {children}
      </PrivateKeyContext.Provider>
      <UnlockDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        isCreatingNew={isCreatingNew}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export const usePrivateKey = (): PrivateKeyContextType => {
  const context = useContext(PrivateKeyContext);
  if (!context) {
    throw new Error("usePrivateKey must be used within a PrivateKeyProvider");
  }
  return context;
};
