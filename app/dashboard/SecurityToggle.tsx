"use client";

import { enableSecurityAction } from "@/actions/enable-security";
import { getUserKeyAction } from "@/actions/get-user-key";
import { SIGN_TEST_MESSAGE } from "@/app.config";
import { usePrivateKey } from "@/components/private-key-context";
import { userKeys } from "@/lib/drizzle/schema";
import {
  decryptPrivateKeyWithPassword,
  exportPrivateKey,
  generateRsaKeyPair,
  exportPublicKey,
  encryptPrivateKeyWithPasswordBase64,
  importPrivateKey,
  signMessage,
} from "@/utils/crypto";
import { base64ToUint8Array, uint8ArrayToBase64 } from "@/utils/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function SecurityToggle() {
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { localPrivateKey, setPrivateLocalKey } = usePrivateKey();

  useEffect(() => {
    if (isMounted) {
      initSecurity();
    } else {
      setIsMounted(true);
    }
  }, [isMounted]);

  async function initSecurity() {
    setLoading(true);
    try {
      const userKeyResult = await getUserKeyAction();
      if (userKeyResult?.serverError) {
        toast.error(userKeyResult.serverError);
        throw new Error(userKeyResult.serverError);
      }

      if (userKeyResult?.data) {
        if (localPrivateKey) {
          const importedPrivateKey = await importPrivateKey(localPrivateKey);
          const signature = await signMessage(
            importedPrivateKey,
            SIGN_TEST_MESSAGE
          );

          const binaryPublicKey = base64ToUint8Array(
            userKeyResult.data.publicKey
          );
          const importedPublicKey = await crypto.subtle.importKey(
            "spki",
            binaryPublicKey,
            {
              name: "RSA-PSS",
              hash: "SHA-256",
            },
            true,
            ["verify"]
          );

          const isValid = await crypto.subtle.verify(
            {
              name: "RSA-PSS",
              saltLength: 32,
            },
            importedPublicKey,
            signature,
            new TextEncoder().encode(SIGN_TEST_MESSAGE)
          );

          if (!isValid) {
            setPrivateLocalKey(null);
            requestPassword(userKeyResult.data);
          } else {
            setIsEnabled(true);
          }
        } else {
          requestPassword(userKeyResult.data);
        }
      } else {
        if (localPrivateKey) {
          setPrivateLocalKey(null);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

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
        base64ToUint8Array(userKey.encryptedPrivateKey),
        password,
        base64ToUint8Array(userKey.salt),
        base64ToUint8Array(userKey.iv)
      );
      setPrivateLocalKey(
        uint8ArrayToBase64(
          new Uint8Array(await exportPrivateKey(decryptedPrivatekey))
        )
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
    const keyPair = await generateRsaKeyPair();
    const publicKeyString = await exportPublicKey(keyPair.publicKey);
    const privateKey = await exportPrivateKey(keyPair.privateKey);
    const privateKeyString = uint8ArrayToBase64(new Uint8Array(privateKey));
    setPrivateLocalKey(privateKeyString);
    const encryptedPrivateKeyData = await encryptPrivateKeyWithPasswordBase64(
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
