"use client";

import Uppy, { BasePlugin, PluginOpts } from "@uppy/core";
import Dashboard from "@uppy/react/lib/Dashboard";
import AwsS3, { type AwsBody } from "@uppy/aws-s3";
import { RefObject } from "react";

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import { toast } from "sonner";
import { getUserKeyAction } from "@/actions/get-user-key";
import { getPartSignedUploadUrlAction } from "@/actions/get-part-signed-upload-url";
import { arrayBufferToBase64 } from "@/utils/utils";
import { createMultipartUploadAction } from "@/actions/create-multipart-upload";
import { listUploadPartsAction } from "@/actions/list-upload-parts";
import { abortMultipartUploadAction } from "@/actions/abort-multipart-upload";
import { completeMultipartUploadAction } from "@/actions/complete-multipart-upload";
import { getSignedUploadUrlAction } from "@/actions/get-signed-upload-url";
import {
  encryptBlobWithMetaAESGCM,
  signMessageWithRSA,
} from "@/utils/crypto/crypto";
import { useTheme } from "next-themes";

export type RequiredMetaFields = {
  encryptedAesKey: string;
  iv: string;
  fileKey: string;
  encryptedFileName: string;
  encryptedFileType: string;
  encryptedFileSize: string;
  nameHash: string;
};

class Encryption extends BasePlugin<PluginOpts, RequiredMetaFields, AwsBody> {
  constructor(uppy: Uppy<RequiredMetaFields, AwsBody>, options: PluginOpts) {
    super(uppy, options);
    this.id = options.id || "encryption";
    this.type = "modifier"; // value doesn't really matter, we may make this optional later
    this.prepareUpload = this.prepareUpload.bind(this);
  }

  async prepareUpload(fileIDs: string[]) {
    const userKeyResult = await getUserKeyAction();
    if (!userKeyResult || userKeyResult.serverError || !userKeyResult.data) {
      toast.error("You need to unlock");
      throw new Error("You need to unlock");
    }

    const promises = fileIDs.map(async (fileID) => {
      const uppyFile = this.uppy.getFile(fileID);
      return await encryptBlobWithMetaAESGCM(
        uppyFile.data,
        uppyFile.name ?? "noname",
        uppyFile.type,
        uppyFile.size ?? 0,
        userKeyResult.data?.publicKey!,
        (progress) => {
          this.uppy.emit("preprocess-progress", uppyFile, {
            mode: "determinate",
            message: `Encrypting ${uppyFile.name}...`,
            value: progress,
          });
        }
      ).then((encrypted) => {
        this.uppy.emit("preprocess-complete", uppyFile);
        this.uppy.setFileState(fileID, {
          data: encrypted.encryptedBlob,
          size: encrypted.encryptedBlob.size,
        });
        this.uppy.setFileMeta(fileID, {
          encryptedAesKey: encrypted.encryptedAesKey,
          iv: encrypted.iv,
          encryptedFileName: encrypted.encryptedFileName,
          encryptedFileType: encrypted.encryptedFileType,
          encryptedFileSize: encrypted.encryptedFileSize,
          nameHash: encrypted.nameHash,
        } as RequiredMetaFields);
      });
    });
    return Promise.all(promises);
  }

  override install() {
    this.uppy.addPreProcessor(this.prepareUpload);
  }

  override uninstall() {
    this.uppy.removePreProcessor(this.prepareUpload);
  }
}

export function createUppy(
  localPrivateKey: RefObject<string | null>,
  currentDirRef: RefObject<string | null>
) {
  const uppy = new Uppy<RequiredMetaFields, AwsBody>({
    restrictions: {
      maxNumberOfFiles: 50,
    },
    autoProceed: true,
  });

  uppy.use(Encryption, {});

  const MiB = 2 ** 20; // 1024 * 1024 bytes = 1 MB

  return uppy.use(AwsS3, {
    shouldUseMultipart: (file) => {
      return file.size! > 100 * MiB;
    },
    getChunkSize: (file) => {
      return 10 * MiB;
    },
    async signPart(fileObject, options) {
      if (!localPrivateKey.current) {
        toast.error("You need to unlock");
        throw new Error("You need to unlock");
      }

      const signature = await signMessageWithRSA(localPrivateKey.current);

      const result = await getPartSignedUploadUrlAction({
        key: options.key,
        uploadId: options.uploadId,
        partNumber: options.partNumber,
        signature: arrayBufferToBase64(signature),
      });

      if (result?.serverError) {
        toast.error(result.serverError);
        throw new Error(result.serverError);
      }

      const data = result?.data!;
      return data;
    },
    async createMultipartUpload(file) {
      if (!localPrivateKey.current) {
        toast.error("You need to unlock");
        throw new Error("You need to unlock");
      }

      const signature = await signMessageWithRSA(localPrivateKey.current);

      const uppyFile = uppy.getFile(file.id);
      const splitted = uppyFile.name?.split(".");
      const extension =
        splitted && splitted.length > 1 ? splitted[splitted.length - 1] : null;

      const result = await createMultipartUploadAction({
        fileExtension: extension,
        signature: arrayBufferToBase64(signature),
        parentId: currentDirRef.current,
        nameHash: uppyFile.meta.nameHash,
      });

      if (result?.serverError) {
        toast.error(result.serverError);
        throw new Error(result.serverError);
      }
      const data = result?.data!;
      return data;
    },
    async listParts(fileObject, options) {
      if (!localPrivateKey.current) {
        toast.error("You need to unlock");
        throw new Error("You need to unlock");
      }

      const signature = await signMessageWithRSA(localPrivateKey.current);

      const result = await listUploadPartsAction({
        key: options.key,
        uploadId: options.uploadId,
        signature: arrayBufferToBase64(signature),
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        throw new Error(result.serverError);
      }
      const data = result?.data!;
      return data;
    },
    async abortMultipartUpload(fileObject, options) {
      if (!localPrivateKey.current) {
        toast.error("You need to unlock");
        throw new Error("You need to unlock");
      }

      const signature = await signMessageWithRSA(localPrivateKey.current);

      const result = await abortMultipartUploadAction({
        key: options.key,
        uploadId: options.uploadId,
        signature: arrayBufferToBase64(signature),
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        throw new Error(result.serverError);
      }
    },
    async completeMultipartUpload(fileObject, options) {
      if (!localPrivateKey.current) {
        toast.error("You need to unlock");
        throw new Error("You need to unlock");
      }

      const signature = await signMessageWithRSA(localPrivateKey.current);

      const result = await completeMultipartUploadAction({
        key: options.key,
        uploadId: options.uploadId,
        parts: options.parts.map((part) => {
          return {
            PartNumber: part.PartNumber!,
            ETag: part.ETag!,
          };
        }),
        signature: arrayBufferToBase64(signature),
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        throw new Error(result.serverError);
      }
      const data = result?.data!;
      uppy.setFileMeta(fileObject.id, {
        fileKey: options.key,
      } as RequiredMetaFields);

      return data;
    },
    async getUploadParameters(fileObject, options) {
      if (!localPrivateKey.current) {
        toast.error("You need to unlock");
        throw new Error("You need to unlock");
      }

      const signature = await signMessageWithRSA(localPrivateKey.current);

      const uppyFile = uppy.getFile(fileObject.id);
      const splitted = uppyFile.name?.split(".");
      const extension =
        splitted && splitted.length > 1 ? splitted[splitted.length - 1] : null;

      const result = await getSignedUploadUrlAction({
        fileExtension: extension,
        signature: arrayBufferToBase64(signature),
        parentId: currentDirRef.current,
        nameHash: uppyFile.meta.nameHash,
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        throw new Error(result.serverError);
      }
      const signedUploadData = result?.data!;

      uppy.setFileMeta(fileObject.id, {
        fileKey: signedUploadData.filePath,
      } as RequiredMetaFields);

      return {
        method: "PUT",
        url: signedUploadData.url,
      };
    },
  });
  // .use(GoldenRetriever, { serviceWorker: true });
}

export function UppyUploader({
  uppy,
}: {
  uppy: Uppy<RequiredMetaFields, AwsBody>;
}) {
  const { theme } = useTheme();

  return (
    <Dashboard
      className="w-full"
      showProgressDetails={true}
      theme={theme === "dark" ? "dark" : "light"}
      singleFileFullScreen={false}
      uppy={uppy}
    />
  );
}
