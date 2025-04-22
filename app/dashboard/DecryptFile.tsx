"use client";

import { getSignedDownloadUrlAction } from "@/actions/get-signed-download-url";
import { usePrivateKey } from "@/components/private-key-context";
import {
  decryptAndSaveWithAESGCM,
  signMessageWithRSA,
} from "@/utils/crypto/crypto";
import { decryptBufferWithRSAPrivateKey } from "@/utils/crypto/rsa-utils";
import {
  uint8ArrayToBase64,
  base64ToUint8Array,
  arrayBufferToBase64,
} from "@/utils/utils";
import { toast } from "sonner";

export function DecryptFile({
  fileId,
  fileName,
  fileSize,
  encryptedFileKey,
}: {
  fileId: string;
  fileName: string;
  fileSize: number;
  encryptedFileKey: string;
}) {
  const { localPrivateKey } = usePrivateKey();

  async function downloadFile() {
    if (!localPrivateKey) {
      toast.error("You need to enable security first");
      return;
    }

    const signature = await signMessageWithRSA(localPrivateKey);

    const downloadUrlResult = await getSignedDownloadUrlAction({
      fileId: fileId,
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
    });
    if (downloadUrlResult?.serverError) {
      toast.error(downloadUrlResult.serverError);
      return;
    }
    const downloadUrl = downloadUrlResult?.data?.url!;

    const aesKeyBuffer = await decryptBufferWithRSAPrivateKey(
      base64ToUint8Array(encryptedFileKey),
      localPrivateKey
    );

    await decryptAndSaveWithAESGCM(
      downloadUrl,
      arrayBufferToBase64(aesKeyBuffer),
      fileName,
      fileSize
    );
  }

  return (
    <button
      className="cursor-pointer border rounded-2xl p-2 hover:bg-gray-300 dark:hover:bg-gray-800"
      onClick={downloadFile}
    >
      Download
    </button>
  );
}
