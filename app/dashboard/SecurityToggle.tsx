"use client";

import { enableSecurityAction } from "@/actions/enable-security";
import { getUserKeyAction } from "@/actions/get-user-key";
import { usePrivateKey } from "@/components/private-key-context";
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
import { useState } from "react";
import { toast } from "sonner";

export function SecurityToggle() {
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const { localPrivateKey, setPrivateLocalKey } = usePrivateKey();

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

    const password = prompt("Enter your master password to enable security");
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
      setIsEnabled(true);
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

    setLoading(true);

    const keyPair = await generateRSAKeyPair();
    const publicKey = await exportRSAPublicKey(keyPair.publicKey);
    const publicKeyString = arrayBufferToBase64(publicKey);
    const privateKey = await exportRSAPrivateKey(keyPair.privateKey);
    const privateKeyString = arrayBufferToBase64(privateKey);

    setPrivateLocalKey(privateKeyString);
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
  }

  return (
    <button
      disabled={isEnabled || loading}
      onClick={handleEnable}
      className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400 disabled:text-gray-700 hover:bg-blue-600 cursor-pointer disabled:cursor-auto"
    >
      {isEnabled
        ? "Secure mode enabled"
        : loading
        ? "Enabling..."
        : "Enable Secure Mode"}
    </button>
  );
}
