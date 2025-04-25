"use client";

import { FileText, X, Image as ImageIcon, File, Download } from "lucide-react";
import { JSX, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Transition } from "@headlessui/react";
import ClientOnlyPortal from "./ClientOnlyPortal";
import { usePrivateKey } from "./private-key-context";
import { toast } from "sonner";
import {
  decryptAndReturnObjectUrlWithAESGCM,
  decryptAndSaveWithAESGCM,
  signMessageWithRSA,
} from "@/utils/crypto/crypto";
import { getSignedDownloadUrlAction } from "@/actions/get-signed-download-url";
import {
  arrayBufferToBase64,
  base64ToUint8Array,
  getFileIcon,
  uint8ArrayToBase64,
} from "@/utils/utils";
import { decryptBufferWithRSAPrivateKey } from "@/utils/crypto/rsa-utils";

type UploadedFile = {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileId: string;
  encryptedKey: string;
  iv: string;
};

export function FilePreviewDialog({
  uploadedFile,
  isOpen,
  handleClose,
}: Readonly<{
  uploadedFile: UploadedFile;
  isOpen: boolean;
  handleClose: () => void;
}>) {
  const [gottenPreview, setGottenPreview] = useState(false);
  const [previewComp, setPreviewComp] = useState<JSX.Element | null>(null);
  const { localPrivateKey } = usePrivateKey();
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) handleOnOpen();
  }, [isOpen]);

  async function handleOnOpen() {
    if (gottenPreview) return;
    setGottenPreview(true);
    const filePreview = await getFilePreview(uploadedFile);
    if (filePreview) {
      setPreviewComp(filePreview);
    }
  }

  async function downloadFile(uploadedFile: UploadedFile) {
    if (urlRef.current) {
      const a = document.createElement("a");
      a.href = urlRef.current;
      a.download = uploadedFile.fileName;
      a.click();
      return;
    }

    try {
      const { downloadUrl, aesKeyBuffer } = await getDownloadUrlData();

      toast.info(`Download starting soon... ${uploadedFile.fileName}`);

      await decryptAndSaveWithAESGCM(
        downloadUrl,
        arrayBufferToBase64(aesKeyBuffer),
        uploadedFile.fileName,
        uploadedFile.fileSize
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function getDownloadUrlData() {
    if (!localPrivateKey) {
      toast.error("You need to unlock");
      throw new Error("You need to unlock");
    }

    const signature = await signMessageWithRSA(localPrivateKey);

    const downloadUrlResult = await getSignedDownloadUrlAction({
      dataId: uploadedFile.fileId,
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
    });
    if (downloadUrlResult?.serverError) {
      toast.error(downloadUrlResult.serverError);
      throw new Error(downloadUrlResult.serverError);
    }
    const downloadUrl = downloadUrlResult?.data?.url!;
    const aesKeyBuffer = await decryptBufferWithRSAPrivateKey(
      base64ToUint8Array(uploadedFile.encryptedKey),
      localPrivateKey
    );

    return {
      downloadUrl,
      aesKeyBuffer,
    };
  }

  async function getFilePreview(fileObj: UploadedFile) {
    if (!localPrivateKey) {
      toast.error("You need to unlock");
      return null;
    }

    if (
      fileObj.fileType.includes("image") ||
      fileObj.fileType.includes("pdf")
    ) {
      try {
        const { downloadUrl, aesKeyBuffer } = await getDownloadUrlData();
        const objectUrl = await decryptAndReturnObjectUrlWithAESGCM(
          downloadUrl,
          arrayBufferToBase64(aesKeyBuffer),
          fileObj.fileType
        );
        urlRef.current = objectUrl;
      } catch (error) {
        console.error(error);
      }
    }

    if (fileObj.fileType.includes("image") && urlRef.current) {
      return (
        <div className="h-full w-full flex items-center justify-center py-6">
          <img
            onClick={(e) => e.stopPropagation()}
            src={urlRef.current}
            alt={fileObj.fileName}
            className="object-cover max-h-full max-w-full align-bottom"
          />
        </div>
      );
    }

    if (fileObj.fileType.includes("pdf") && urlRef.current) {
      return (
        <object
          data={urlRef.current}
          type="application/pdf"
          className="w-full h-full"
        />
      );
    }

    return (
      <div
        className="flex flex-col items-center justify-center p-8 bg-background rounded-md"
        onClick={(e) => e.stopPropagation()}
      >
        {getFileIcon(fileObj.fileType, 5)}
        <p className="mt-2 text-xl md:text-2xl text-muted-foreground">
          Preview not available
        </p>
      </div>
    );
  }

  return (
    <ClientOnlyPortal selector="#preview-portal">
      <Transition show={isOpen}>
        <div
          className="fixed h-screen w-full top-0 left-0 z-[99] bg-black/80 backdrop-blur transition duration-150 ease-in data-[closed]:opacity-0 flex flex-col requires-no-scroll"
          onClick={handleClose}
        >
          <div
            className="p-4 flex items-center gap-2 justify-between bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Button
                className="[&_svg]:size-6 text-muted-foreground"
                variant="ghost"
                size="icon"
                onClick={handleClose}
              >
                <X />
                <span className="sr-only">Close</span>
              </Button>
              {getFileIcon(uploadedFile.fileType, 5)}
              <h2 className="font-semibold text-muted-foreground break-words break-all">
                {uploadedFile.fileName}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => downloadFile(uploadedFile)}
              >
                <Download />
                <span>Download</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex items-center justify-center">
            {previewComp}
          </div>
        </div>
      </Transition>
    </ClientOnlyPortal>
  );
}
