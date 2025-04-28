"use client";

import { usePrivateKey } from "@/components/private-key-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { UppyUploader } from "./UppyUploader";

export function UploadFilesButton() {
  const { localPrivateKey } = usePrivateKey();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!localPrivateKey}>
          <Upload />
          Upload Files
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="mb-4">
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        <UppyUploader />
      </DialogContent>
    </Dialog>
  );
}
