"use client";

import { deleteUploadedFileAction } from "@/actions/delete-uploaded-file";
import {
  importPrivateKey,
  signMessage,
  uint8ArrayToBase64,
} from "@/utils/crypto";

export function DeleteFileButton({ fileId }: { fileId: string }) {
  async function deleteFile() {
    const localPrivateKey = localStorage.getItem("privateKey");
    if (!localPrivateKey) {
      alert("You need to enable security first");
      return;
    }

    if (
      !confirm("Are you sure you want to delete this file?. This is permanent.")
    ) {
      return;
    }

    const importedPrivateKey = await importPrivateKey(localPrivateKey);
    const signature = await signMessage(importedPrivateKey, "hello");

    const result = await deleteUploadedFileAction({
      fileId: fileId,
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
      signatureMessage: "hello",
    });

    if (result?.serverError) {
      alert(result.serverError);
      return;
    }
    alert("File deleted");
  }

  return (
    <button
      className="cursor-pointer border rounded-2xl p-2 hover:bg-gray-800"
      onClick={deleteFile}
    >
      Delete File
    </button>
  );
}
