"use client";

import { DecryptFile } from "./DecryptFile";
import { DeleteFileButton } from "./DeleteFileButton";
import { formatFileSize } from "@/utils/utils";
import { useUserFiles } from "@/components/user-files-context";
import { usePrivateKey } from "@/components/private-key-context";
import { RefreshCcw } from "lucide-react";

export function UserFiles() {
  const { localPrivateKey } = usePrivateKey();
  const { userAvailableFiles, refetchFiles, loading } = useUserFiles();

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center gap-2">
        <h2>Uploaded Files</h2>
        {localPrivateKey && (
          <button
            disabled={loading}
            className="cursor-pointer border rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-800"
            onClick={refetchFiles}
          >
            <RefreshCcw className={`${loading ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>
      {userAvailableFiles.length === 0 ? (
        <p className="text-center font-bold">
          {localPrivateKey ? "No files uploaded" : "Security disabled"}
        </p>
      ) : (
        userAvailableFiles.map((availableFile) => (
          <div
            key={availableFile.id}
            className="p-2 bg-gray-200 dark:bg-gray-900 w-full rounded-lg flex items-center gap-2 justify-between flex-wrap"
          >
            <div>
              <h3 className="font-semibold break-words break-all max-w-48">
                {availableFile.encryptedFileName}
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-gray-500 truncate max-w-48">
                  {availableFile.encryptedFileType},
                </p>
                <p className="text-gray-500">
                  {formatFileSize(Number(availableFile.encryptedFileSize))}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DecryptFile
                fileId={availableFile.id}
                fileName={availableFile.encryptedFileName}
                fileSize={Number(availableFile.encryptedFileSize)}
                encryptedFileKey={availableFile.encryptedFileKey}
              />
              <DeleteFileButton fileId={availableFile.id} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
