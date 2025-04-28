"use client";

import { enableSecurityAction } from "@/actions/enable-security";
import { getUserKeyAction } from "@/actions/get-user-key";
import { usePrivateKey } from "@/components/private-key-context";
import { Button } from "@/components/ui/button";
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
import { Unlock, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SecurityToggle() {
  const [loading, setLoading] = useState(false);
  const { localPrivateKey, setPrivateLocalKey, lock } = usePrivateKey();

  async function handleEnable() {
    const userKeyResult = await getUserKeyAction();
    if (userKeyResult?.serverError) {
      toast.error(userKeyResult.serverError);
      throw new Error(userKeyResult.serverError);
    }

    if (userKeyResult?.data) {
      requestPassword(userKeyResult.data);
    } else {
      handleNewSecurity();
    }
  }

  async function requestPassword(userKey: typeof userKeys.$inferSelect) {
    setLoading(true);

    const password = prompt("Enter your master password to unlock");
    if (!password) {
      setLoading(false);
      return;
    }

    try {
      const decryptedPrivatekey = await decryptPrivateKeyWithPassword(
        userKey.encryptedPrivateKey,
        password,
        userKey.salt,
        userKey.iv
      );
      setPrivateLocalKey(
        arrayBufferToBase64(await exportRSAPrivateKey(decryptedPrivatekey))
      );
    } catch (error) {
      toast.error("Incorrect password");
    }
    setLoading(false);
  }

  async function handleNewSecurity() {
    const password = prompt(
      "Set a master password (DO NOT FORGET, CANNOT RECOVER)"
    );
    if (!password) return;
    const confirmationPassword = prompt(
      "Enter master password again to confirm"
    );
    if (password !== confirmationPassword) {
      toast.error("Passwords do not match");
      return;
    }

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
    await enableSecurityAction({
      publicKey: publicKeyString,
      encryptedPrivateKey: encryptedPrivateKeyData.encryptedPrivateKey,
      salt: encryptedPrivateKeyData.salt,
      iv: encryptedPrivateKeyData.iv,
    });

    setLoading(false);
    setPrivateLocalKey(privateKeyString);
  }

  return (
    <Button
      variant={!localPrivateKey ? "destructive" : "outline"}
      onClick={localPrivateKey ? lock : handleEnable}
    >
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : !localPrivateKey ? (
        <>
          <Unlock className="h-4 w-4" />
          Unlock
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" />
          Lock
        </>
      )}
    </Button>
  );
}
