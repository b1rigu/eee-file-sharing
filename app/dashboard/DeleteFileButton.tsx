"use client";

import { deleteUploadedFileAction } from "@/actions/delete-uploaded-file";
import { SIGN_TEST_MESSAGE } from "@/app.config";
import { usePrivateKey } from "@/components/private-key-context";
import { importPrivateKey, signMessage } from "@/utils/crypto";
import { uint8ArrayToBase64 } from "@/utils/utils";
import { toast } from "sonner";

export function DeleteFileButton({ fileId }: { fileId: string }) {
  const { localPrivateKey } = usePrivateKey();

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

    const importedPrivateKey = await importPrivateKey(localPrivateKey);
    const signature = await signMessage(importedPrivateKey, SIGN_TEST_MESSAGE);

    const result = await deleteUploadedFileAction({
      fileId: fileId,
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
      signatureMessage: SIGN_TEST_MESSAGE,
    });

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }
    toast.success("File deleted");
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
