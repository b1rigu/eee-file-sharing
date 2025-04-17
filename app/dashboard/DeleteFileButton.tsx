"use client";

import { deleteUploadedFileAction } from "@/actions/delete-uploaded-file";

export function DeleteFileButton({ fileId }: { fileId: string }) {
  async function deleteFile() {
    if (!confirm("Are you sure you want to delete this file?. This is permanent.")) {
      return;
    }

    const result = await deleteUploadedFileAction({
      fileId: fileId,
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
