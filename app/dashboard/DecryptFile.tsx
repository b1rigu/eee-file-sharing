"use client";

import { getSignedDownloadUrlAction } from "@/actions/get-signed-download-url";
import {
  base64ToUint8Array,
  importDecryptPrivateKey,
  importPrivateKey,
  signMessage,
  uint8ArrayToBase64,
} from "@/utils/crypto";

export function DecryptFile({
  fileId,
  fileName,
  encryptedFileKey,
  iv,
}: {
  fileId: string;
  fileName: string;
  encryptedFileKey: string;
  iv: string;
}) {
  async function downloadFile() {
    const localPrivateKey = localStorage.getItem("privateKey");
    if (!localPrivateKey) {
      alert("You need to enable security first");
      return;
    }

    const importedPrivateKey = await importPrivateKey(localPrivateKey);
    console.log("importedPrivateKey", importedPrivateKey);
    const signature = await signMessage(importedPrivateKey, "hello");

    const downloadUrlResult = await getSignedDownloadUrlAction({
      fileId: fileId,
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
      signatureMessage: "hello",
    });
    if (downloadUrlResult?.serverError) {
      alert(downloadUrlResult.serverError);
      return;
    }
    const downloadUrl = downloadUrlResult?.data?.url!;

    try {
      const response = await fetch(downloadUrl, {
        method: "GET",
      });

      const blob = await response.blob();
      const encryptedFileBuffer = await blob.arrayBuffer();

      const importedDecryptPrivateKey = await importDecryptPrivateKey(localPrivateKey);

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
        encryptedFileBuffer
      );

      // After decryption
      const decryptedBlob = new Blob([decryptedBuffer]);

      const url = URL.createObjectURL(decryptedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <button
      className="cursor-pointer border rounded-2xl p-2 hover:bg-gray-300 dark:hover:bg-gray-800"
      onClick={downloadFile}
    >
      Download {fileName}
    </button>
  );
}
