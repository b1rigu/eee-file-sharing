"use client";

import { getSignedDownloadUrlAction } from "@/actions/get-signed-download-url";
import { base64ToUint8Array, importPrivateKey } from "@/utils/crypto";

export function DecryptFile({
  fileId,
  fileName,
  filePath,
  encryptedFileKey,
  iv,
}: {
  fileId: string;
  fileName: string;
  filePath: string;
  encryptedFileKey: string;
  iv: string;
}) {
  async function downloadFile() {
    const downloadUrlResult = await getSignedDownloadUrlAction({
      fileId: fileId,
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

      const localPrivateKey = localStorage.getItem("privateKey");
      if (!localPrivateKey) {
        alert("You need to enable security first");
        return;
      }

      const importedPrivateKey = await importPrivateKey(localPrivateKey);

      const rawAesKey = await crypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
        },
        importedPrivateKey,
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
      className="cursor-pointer border rounded-2xl p-2 hover:bg-gray-800"
      onClick={downloadFile}
    >
      Download {fileName}
    </button>
  );
}
