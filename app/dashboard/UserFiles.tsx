"use client";

import { getUserFilesAction } from "@/actions/get-user-files";
import { usePrivateKey } from "@/components/private-key-context";
import { fileAccess, uploadedFiles } from "@/lib/drizzle/schema";
import { useEffect, useState } from "react";
import { DecryptFile } from "./DecryptFile";
import { DeleteFileButton } from "./DeleteFileButton";
import { SIGN_TEST_MESSAGE } from "@/app.config";
import {
  importDecryptPrivateKey,
  importPrivateKey,
  signMessage,
} from "@/utils/crypto";
import {
  base64ToUint8Array,
  formatFileSize,
  uint8ArrayToBase64,
} from "@/utils/utils";
import { toast } from "sonner";

export function UserFiles({ totalCount }: { totalCount: number }) {
  const { localPrivateKey } = usePrivateKey();
  const [userAvailableFiles, setUserAvailableFiles] = useState<
    {
      file_access: typeof fileAccess.$inferSelect;
      uploaded_files: typeof uploadedFiles.$inferSelect | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserFiles();
  }, [localPrivateKey, totalCount]);

  async function getUserFiles() {
    if (!localPrivateKey) {
      return;
    }

    setLoading(true);
    const importedPrivateKey = await importPrivateKey(localPrivateKey);
    const signature = await signMessage(importedPrivateKey, SIGN_TEST_MESSAGE);

    const userFilesResult = await getUserFilesAction({
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
      signatureMessage: SIGN_TEST_MESSAGE,
    });
    setLoading(false);
    if (userFilesResult?.serverError) {
      toast.error(userFilesResult.serverError);
      return;
    }

    if (!userFilesResult?.data) {
      return;
    }

    const mappedUserFiles = await Promise.all(
      userFilesResult.data.map(async (item) => {
        if (item.uploaded_files) {
          return {
            ...item,
            uploaded_files: {
              ...item.uploaded_files,
              fileName: await decryptText(
                item.uploaded_files.fileName,
                item.file_access.encryptedFileKey,
                item.file_access.iv
              ),
              fileType: await decryptText(
                item.uploaded_files.fileType,
                item.file_access.encryptedFileKey,
                item.file_access.iv
              ),
              fileSize: await decryptText(
                item.uploaded_files.fileSize,
                item.file_access.encryptedFileKey,
                item.file_access.iv
              ),
            },
          };
        }
        return item; // Keep unchanged if uploaded_files is null
      })
    );

    setUserAvailableFiles(mappedUserFiles);
  }

  async function decryptText(
    encryptedText: string,
    encryptedFileKey: string,
    iv: string
  ) {
    if (!localPrivateKey) {
      return "";
    }

    try {
      const importedDecryptPrivateKey = await importDecryptPrivateKey(
        localPrivateKey
      );

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
        base64ToUint8Array(encryptedText)
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error(error);
      return "";
    }
  }

  return (
    <>
      {loading ? (
        <p className="text-center font-bold">Loading...</p>
      ) : userAvailableFiles.length === 0 ? (
        <p className="text-center font-bold">
          No files uploaded or security disabled
        </p>
      ) : (
        userAvailableFiles.map((availableFile) => (
          <div
            key={availableFile.file_access.id}
            className="p-2 bg-gray-200 dark:bg-gray-900 w-full rounded-lg flex items-center gap-2 justify-between flex-wrap"
          >
            <div>
              <h3 className="font-semibold">
                {availableFile.uploaded_files?.fileName}
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-gray-500">
                  {availableFile.uploaded_files?.fileType},
                </p>
                <p className="text-gray-500">
                  {formatFileSize(
                    Number(availableFile.uploaded_files?.fileSize!)
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DecryptFile
                fileId={availableFile.file_access.fileId}
                fileName={availableFile.uploaded_files?.fileName!}
                encryptedFileKey={availableFile.file_access.encryptedFileKey}
                iv={availableFile.file_access.iv}
              />
              <DeleteFileButton fileId={availableFile.file_access.fileId} />
            </div>
          </div>
        ))
      )}
    </>
  );
}
