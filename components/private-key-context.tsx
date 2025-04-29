"use client";

import { enableSecurityAction } from "@/actions/enable-security";
import { getUserKeyAction } from "@/actions/get-user-key";
import { userKeys } from "@/lib/drizzle/schema";
import {
  decryptPrivateKeyWithPassword,
  encryptPrivateKeyWithPassword,
  generateDashedUppercaseRecoveryKey,
  signMessageWithRSA,
} from "@/utils/crypto/crypto";
import {
  exportRSAPrivateKey,
  exportRSAPublicKey,
  generateRSAKeyPair,
  importRSAPrivateKeyToDecrypt,
} from "@/utils/crypto/rsa-utils";
import { arrayBufferToBase64, uint8ArrayToBase64 } from "@/utils/utils";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { UnlockDialog } from "./UnlockDialog";
import { changePasswordAction } from "@/actions/change-password";
import { rotateRecoverKeyAction } from "@/actions/rotate-recovery-key";

type PrivateKeyContextType = {
  localPrivateKey: string | null;
  lock: () => void;
  handleEnable: () => void;
  handleResetPassword: (newPassword: string) => Promise<void>;
  handleRotateRecoveryKey: () => Promise<void>;
  handleRecovery: (
    recoveryKey: string,
    newPassword: string
  ) => Promise<boolean>;
  loading: boolean;
  recoveryKey: string | null;
  clearRecoveryKey: () => void;
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
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);

  function lock() {
    setPrivateLocalKeyState(null);
    setUserKey(null);
  }

  function clearRecoveryKey() {
    setRecoveryKey(null);
  }

  async function handleRecovery(recoveryKey: string, newPassword: string) {
    const userKeyResult = await getUserKeyAction();
    if (userKeyResult?.serverError) {
      toast.error(userKeyResult.serverError);
      return false;
    }

    try {
      const userKeyData = userKeyResult?.data!;

      const decryptedPrivatekey = await decryptPrivateKeyWithPassword(
        userKeyData.encryptedPrivateKeyRecovery,
        recoveryKey,
        userKeyData.recoverySalt,
        userKeyData.recoveryIv
      );

      const privateKeyString = arrayBufferToBase64(
        await exportRSAPrivateKey(decryptedPrivatekey)
      );

      const signature = await signMessageWithRSA(privateKeyString);

      const encryptedNewPrivateKeyData = await encryptPrivateKeyWithPassword(
        decryptedPrivatekey,
        newPassword
      );

      const result = await changePasswordAction({
        signature: uint8ArrayToBase64(new Uint8Array(signature)),
        encryptedPrivateKey: encryptedNewPrivateKeyData.encryptedPrivateKey,
        salt: encryptedNewPrivateKeyData.salt,
        iv: encryptedNewPrivateKeyData.iv,
      });

      if (result?.serverError) {
        toast.error(result.serverError);
        throw new Error(result.serverError);
      }

      toast.success("Succesfully reset password");
      lock();
      return true;
    } catch (error) {
      toast.error("Error resetting password");
      return false;
    }
  }

  async function handleResetPassword(newPassword: string) {
    if (!confirm("Are you sure you want to reset your password?")) return;

    if (!localPrivateKey) return;
    const importedPrivateKey = await importRSAPrivateKeyToDecrypt(
      localPrivateKey
    );
    const encryptedNewPrivateKeyData = await encryptPrivateKeyWithPassword(
      importedPrivateKey,
      newPassword
    );
    const signature = await signMessageWithRSA(localPrivateKey);

    const result = await changePasswordAction({
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
      encryptedPrivateKey: encryptedNewPrivateKeyData.encryptedPrivateKey,
      salt: encryptedNewPrivateKeyData.salt,
      iv: encryptedNewPrivateKeyData.iv,
    });

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }

    toast.success("Succesfully changed password");
    lock();
  }

  async function handleRotateRecoveryKey() {
    if (!confirm("Are you sure you want to rotate your recovery key?")) return;

    if (!localPrivateKey) return;
    const importedPrivateKey = await importRSAPrivateKeyToDecrypt(
      localPrivateKey
    );

    const signature = await signMessageWithRSA(localPrivateKey);

    const recoveryKey = generateDashedUppercaseRecoveryKey();
    const encryptedWithRecoveryKey = await encryptPrivateKeyWithPassword(
      importedPrivateKey,
      recoveryKey
    );

    const result = await rotateRecoverKeyAction({
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
      encryptedPrivateKey: encryptedWithRecoveryKey.encryptedPrivateKey,
      salt: encryptedWithRecoveryKey.salt,
      iv: encryptedWithRecoveryKey.iv,
    });

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }

    toast.success("Succesfully rotated recovery key");
    setRecoveryKey(recoveryKey);
    lock();
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
    const recoveryKey = generateDashedUppercaseRecoveryKey();
    const encryptedWithRecoveryKey = await encryptPrivateKeyWithPassword(
      keyPair.privateKey,
      recoveryKey
    );

    const result = await enableSecurityAction({
      publicKey: publicKeyString,
      encryptedPrivateKey: encryptedPrivateKeyData.encryptedPrivateKey,
      salt: encryptedPrivateKeyData.salt,
      iv: encryptedPrivateKeyData.iv,
      encryptedPrivateKeyRecovery: encryptedWithRecoveryKey.encryptedPrivateKey,
      recoverySalt: encryptedWithRecoveryKey.salt,
      recoveryIv: encryptedWithRecoveryKey.iv,
    });

    if (result?.serverError) {
      toast.error(result.serverError);
      setLoading(false);
      return;
    }

    setRecoveryKey(recoveryKey);
    setLoading(false);
    setPrivateLocalKeyState(privateKeyString);
    setIsDialogOpen(false);
  }

  return (
    <>
      <PrivateKeyContext.Provider
        value={{
          localPrivateKey,
          lock,
          handleEnable,
          loading,
          recoveryKey,
          clearRecoveryKey,
          handleResetPassword,
          handleRotateRecoveryKey,
          handleRecovery,
        }}
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
