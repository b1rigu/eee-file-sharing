"use client";

import { deleteUploadedFileAction } from "@/actions/delete-uploaded-file";
import { usePrivateKey } from "@/components/private-key-context";
import { useUserFiles } from "@/components/user-files-context";
import { signMessageWithRSA } from "@/utils/crypto/crypto";
import { uint8ArrayToBase64 } from "@/utils/utils";
import { toast } from "sonner";

export function DeleteFileButton({ fileId }: { fileId: string }) {
  const { localPrivateKey } = usePrivateKey();
  const { refetchFiles } = useUserFiles();

  async function deleteFile() {
    if (!localPrivateKey) {
      toast.error("You need to enable security first");
      return;
    }

    if (
      !confirm("Are you sure you want to delete this file?. This is permanent.")
    ) {
      return;
    }

    const signature = await signMessageWithRSA(localPrivateKey);

    const result = await deleteUploadedFileAction({
      fileId: fileId,
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
    });

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }
    toast.success("File deleted");
    refetchFiles();
  }

  return (
    <button
      className="cursor-pointer border rounded-2xl p-2 hover:bg-gray-300 dark:hover:bg-gray-800"
      onClick={deleteFile}
    >
      Delete
    </button>
  );
}
