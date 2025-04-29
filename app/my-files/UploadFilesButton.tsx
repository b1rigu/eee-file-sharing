"use client";

import { usePrivateKey } from "@/components/private-key-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { createUppy, RequiredMetaFields, UppyUploader } from "./UppyUploader";
import { useEffect, useRef, useState } from "react";
import { UploadResult, UppyFile } from "@uppy/core";
import { AwsBody } from "@uppy/aws-s3";
import { useDirectory } from "@/components/directory-provider";
import { toast } from "sonner";
import { signMessageWithRSA } from "@/utils/crypto/crypto";
import { insertUploadedFileAction } from "@/actions/insert-uploaded-file";
import { arrayBufferToBase64 } from "@/utils/utils";
import { useUserData } from "@/components/user-data-context";

export function UploadFilesButton() {
  const { localPrivateKey } = usePrivateKey();
  const localPrivateKeyRef = useRef<string | null>(null);
  const currentDirRef = useRef<string | null>(null);
  const { currentDir } = useDirectory();
  const { refetchData } = useUserData();
  const [uppy] = useState(createUppy(localPrivateKeyRef, currentDirRef));

  useEffect(() => {
    currentDirRef.current = currentDir;
  }, [currentDir]);

  useEffect(() => {
    localPrivateKeyRef.current = localPrivateKey;
  }, [localPrivateKey]);

  useEffect(() => {
    function handleFileUploadComplete(
      result: UploadResult<RequiredMetaFields, AwsBody>
    ) {
      const { successful = [], failed } = result;

      if (successful.length === 0) return;

      refetchData();
      toast.success(`${successful.length} files uploaded successfully!`);
    }

    async function handleFileUploadSuccess(
      uppyFile: UppyFile<RequiredMetaFields, AwsBody> | undefined
    ) {
      if (!uppyFile) return;

      const validUpload = {
        fileKey: uppyFile.meta.fileKey,
        encryptedFileName: uppyFile.meta.encryptedFileName,
        encryptedFileType: uppyFile.meta.encryptedFileType,
        encryptedFileSize: uppyFile.meta.encryptedFileSize,
        encryptedFileKey: uppyFile.meta.encryptedAesKey,
        iv: uppyFile.meta.iv,
        nameHash: uppyFile.meta.nameHash,
      };

      if (!localPrivateKeyRef.current) {
        toast.error("You need to unlock first");
        throw new Error("You need to unlock first");
      }

      const signature = await signMessageWithRSA(localPrivateKeyRef.current);

      const insertResult = await insertUploadedFileAction({
        parentId: currentDirRef.current,
        signature: arrayBufferToBase64(signature),
        validUploads: [validUpload],
      });

      if (insertResult?.serverError) {
        toast.error(insertResult.serverError);
        throw new Error(insertResult.serverError);
      }
    }

    uppy.on("complete", handleFileUploadComplete);
    uppy.on("upload-success", handleFileUploadSuccess);

    return () => {
      uppy.off("complete", handleFileUploadComplete);
      uppy.off("upload-success", handleFileUploadSuccess);
    };
  }, [refetchData]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!localPrivateKey}>
          <Upload />
          Upload Files
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="mb-4">
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        <UppyUploader uppy={uppy} />
      </DialogContent>
    </Dialog>
  );
}
