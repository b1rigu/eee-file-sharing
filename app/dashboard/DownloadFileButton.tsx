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

export function DownloadFileButton({
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
      toast.error("You need to unlock");
      return;
    }

    const signature = await signMessageWithRSA(localPrivateKey);

    const downloadUrlResult = await getSignedDownloadUrlAction({
      dataId: fileId,
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

    toast.info(`Download starting soon... ${fileName}`);

    await decryptAndSaveWithAESGCM(
      downloadUrl,
      arrayBufferToBase64(aesKeyBuffer),
      fileName,
      fileSize
    );
  }

  return (
    <div className="w-full h-full" onClick={downloadFile}>
      Download
    </div>
  );
}
