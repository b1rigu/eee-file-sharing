"use client";

import { deleteUploadedDataAction } from "@/actions/delete-uploaded-data";
import { usePrivateKey } from "@/components/private-key-context";
import { useUserData } from "@/components/user-data-context";
import { signMessageWithRSA } from "@/utils/crypto/crypto";
import { uint8ArrayToBase64 } from "@/utils/utils";
import { toast } from "sonner";

export function DeleteFileButton({ dataId }: { dataId: string }) {
  const { localPrivateKey } = usePrivateKey();
  const { refetchData } = useUserData();

  async function deleteData() {
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

    const result = await deleteUploadedDataAction({
      dataId: dataId,
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
    });

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }
    toast.success("File deleted");
    refetchData();
  }

  return (
    <div className="w-full h-full" onClick={deleteData}>
      Delete
    </div>
  );
}
