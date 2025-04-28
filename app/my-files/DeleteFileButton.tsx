"use client";

import { deleteUploadedDataAction } from "@/actions/delete-uploaded-data";
import { usePrivateKey } from "@/components/private-key-context";
import { ContextMenuItem } from "@/components/ui/context-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useUserData } from "@/components/user-data-context";
import { signMessageWithRSA } from "@/utils/crypto/crypto";
import { uint8ArrayToBase64 } from "@/utils/utils";
import { toast } from "sonner";

export function DeleteDataButton({
  dataId,
  contextMenu = false,
}: {
  dataId: string;
  contextMenu?: boolean;
}) {
  const { localPrivateKey } = usePrivateKey();
  const { refetchData } = useUserData();

  async function deleteData() {
    if (!localPrivateKey) {
      toast.error("You need to unlock");
      return;
    }

    if (!confirm("Are you sure you want to delete this?. This is permanent.")) {
      return;
    }

    const signature = await signMessageWithRSA(localPrivateKey);

    const result = await deleteUploadedDataAction({
      dataIds: [dataId],
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
    });

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }
    toast.success("Deleted");
    refetchData();
  }

  if (contextMenu) {
    return <ContextMenuItem onClick={deleteData}>Delete</ContextMenuItem>;
  }
  return <DropdownMenuItem onClick={deleteData}>Delete</DropdownMenuItem>;
}
