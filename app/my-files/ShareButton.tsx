"use client";

import { getUserKeyByEmailAction } from "@/actions/get-user-key-by-email";
import { removeSharedAccessAction } from "@/actions/remove-shared-access-action";
import { shareFileAction } from "@/actions/share-file";
import { UserData } from "@/actions/types";
import { usePrivateKey } from "@/components/private-key-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUserData } from "@/components/user-data-context";
import { signMessageWithRSA } from "@/utils/crypto/crypto";
import {
  decryptBufferWithRSAPrivateKey,
  encryptBufferWithRSAPublicKey,
} from "@/utils/crypto/rsa-utils";
import {
  arrayBufferToBase64,
  base64ToUint8Array,
  uint8ArrayToBase64,
} from "@/utils/utils";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ShareButton({
  item,
  shareDialogOpen,
  setShareDialogOpen,
}: {
  item: UserData;
  shareDialogOpen: boolean;
  setShareDialogOpen: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { localPrivateKey } = usePrivateKey();
  const { refetchData } = useUserData();

  async function handleShare() {
    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0) return;
    if (!localPrivateKey) {
      toast.error("You need to unlock");
      return;
    }

    setLoading(true);

    try {
      const signature = await signMessageWithRSA(localPrivateKey);

      const sharingUserKeyResult = await getUserKeyByEmailAction({
        email: trimmedEmail,
        signature: uint8ArrayToBase64(new Uint8Array(signature)),
      });

      if (sharingUserKeyResult?.serverError) {
        throw new Error(sharingUserKeyResult.serverError);
      }

      const sharingUserKey = sharingUserKeyResult?.data!;

      const aesKeyBuffer = await decryptBufferWithRSAPrivateKey(
        base64ToUint8Array(item.encryptedKey),
        localPrivateKey
      );

      const sharingUserEncryptedKey = await encryptBufferWithRSAPublicKey(
        aesKeyBuffer,
        sharingUserKey
      );

      const shareFileResult = await shareFileAction({
        receiverEmail: trimmedEmail,
        nodeId: item.id,
        encryptedKey: arrayBufferToBase64(sharingUserEncryptedKey),
        signature: uint8ArrayToBase64(new Uint8Array(signature)),
      });

      if (shareFileResult?.serverError) {
        throw new Error(shareFileResult.serverError);
      }

      setEmail("");
      toast.success(`Shared with ${trimmedEmail}`);
      refetchData();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function removeAccess(receiverId: string) {
    if (!localPrivateKey) {
      toast.error("You need to unlock");
      return;
    }
    const signature = await signMessageWithRSA(localPrivateKey);
    const result = await removeSharedAccessAction({
      receiverId,
      signature: uint8ArrayToBase64(new Uint8Array(signature)),
      nodeId: item.id,
    });
    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }
    toast.success("Removed access");
    refetchData();
  }

  return (
    <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
      <DialogContent className="sm:max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>
            Share "{item.encryptedName}" with others. They will have view-only
            access. The user has to be signed up.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="email" className="sr-only">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            onClick={handleShare}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Share
          </Button>
        </div>

        {
          <>
            <Separator className="my-2" />
            <div className="space-y-4">
              <h4 className="text-sm font-medium">People with access</h4>
              {item.sharedFiles.length === 0 ? (
                <div className="py-3 text-center text-sm text-muted-foreground">
                  Shared with no one yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {item.sharedFiles.map((sharedFile) => (
                    <div
                      key={sharedFile.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={sharedFile.receiver.image ?? undefined}
                            alt={sharedFile.receiver.name}
                          />
                          <AvatarFallback>
                            {sharedFile.receiver.name}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {sharedFile.receiver.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sharedFile.receiver.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          View only
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeAccess(sharedFile.receiverId)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove access</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        }
      </DialogContent>
    </Dialog>
  );
}
