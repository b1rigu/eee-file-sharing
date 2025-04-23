"use client";

import { createFolderAction } from "@/actions/create-folder";
import { getUserKeyAction } from "@/actions/get-user-key";
import { useDirectory } from "@/components/directory-provider";
import { usePrivateKey } from "@/components/private-key-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserData } from "@/components/user-data-context";
import {
  encryptTextWithPublicKey,
  signMessageWithRSA,
} from "@/utils/crypto/crypto";
import { arrayBufferToBase64 } from "@/utils/utils";
import { Folder } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function NewFolderButton() {
  const { currentDir } = useDirectory();
  const [folderName, setFolderName] = useState("");
  const { localPrivateKey } = usePrivateKey();
  const { refetchData } = useUserData();

  async function handleFolderCreate() {
    if (!localPrivateKey) {
      return;
    }

    const userKeyResult = await getUserKeyAction();
    if (!userKeyResult || userKeyResult.serverError || !userKeyResult.data) {
      toast.error("You need to unlock");
      return;
    }

    const signature = await signMessageWithRSA(localPrivateKey);

    const encryptedData = await encryptTextWithPublicKey(
      folderName,
      userKeyResult.data.publicKey
    );

    const result = await createFolderAction({
      parentId: currentDir,
      signature: arrayBufferToBase64(signature),
      iv: encryptedData.iv,
      encryptedKey: encryptedData.encryptedAesKey,
      encryptedName: encryptedData.encryptedText,
    });

    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }

    refetchData();
    toast.success("Folder created");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={!localPrivateKey}>
          <Folder />
          New Folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="mb-8">
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5 mb-4">
          <Label htmlFor="folderName">Folder name</Label>
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            type="text"
            id="folderName"
            placeholder="Folder name"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleFolderCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
