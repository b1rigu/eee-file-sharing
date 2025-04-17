"use client";

import { enableSecurityAction } from "@/actions/enable-security";
import { userKeys } from "@/lib/drizzle/schema";
import {
  base64ToUint8Array,
  decryptPrivateKeyWithPassword,
  uint8ArrayToBase64,
  exportPrivateKey,
  generateRsaKeyPair,
  exportPublicKey,
  encryptPrivateKeyWithPasswordBase64,
} from "@/utils/crypto";
import { useEffect, useState } from "react";

export function SecurityToggle({
  userKey,
}: {
  userKey: typeof userKeys.$inferSelect | undefined;
}) {
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    tryDecryptingPrivateKey();
  }, []);

  async function tryDecryptingPrivateKey() {
    setLoading(true);

    if (!userKey) {
      setLoading(false);
      return;
    }

    const localPrivateKey = localStorage.getItem("privateKey");
    if (localPrivateKey) {
      setIsEnabled(true);
    } else {
      const password = prompt("Enter your master password to enable security");
      if (!password) {
        setLoading(false);
        return;
      }

      const encryptedPrivateKey = base64ToUint8Array(
        userKey.encryptedPrivateKey
      );
      const salt = base64ToUint8Array(userKey.salt);
      const iv = base64ToUint8Array(userKey.iv);

      try {
        const decryptedPrivatekey = await decryptPrivateKeyWithPassword(
          encryptedPrivateKey,
          password,
          salt,
          iv
        );
        localStorage.setItem(
          "privateKey",
          uint8ArrayToBase64(
            new Uint8Array(await exportPrivateKey(decryptedPrivatekey))
          )
        );
        setIsEnabled(true);
      } catch (error) {
        alert("Incorrect password");
      }
    }
    setLoading(false);
  }

  const handleEnable = async () => {
    const password = prompt(
      "Set a master password (DO NOT FORGET, CANNOT RECOVER)"
    );
    if (!password) return;

    setLoading(true);
    const keyPair = await generateRsaKeyPair();
    const publicKeyString = await exportPublicKey(keyPair.publicKey);
    const privateKey = await exportPrivateKey(keyPair.privateKey);
    const privateKeyString = uint8ArrayToBase64(new Uint8Array(privateKey));
    localStorage.setItem("privateKey", privateKeyString);
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
  };

  return (
    <button
      disabled={isEnabled || loading}
      onClick={userKey ? tryDecryptingPrivateKey : handleEnable}
      className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400 disabled:text-gray-700 hover:bg-blue-600 cursor-pointer disabled:cursor-auto"
    >
      {isEnabled ? "Secure mode enabled" : loading ? "Enabling..." : "Enable Secure Mode"}
    </button>
  );
}
