"use client";

import { getSignedUploadUrlAction } from "@/actions/get-signed-upload-url";
import { getUserKeyAction } from "@/actions/get-user-key";
import { insertUploadedFileAction } from "@/actions/insert-uploaded-file";
import { SIGN_TEST_MESSAGE } from "@/app.config";
import { usePrivateKey } from "@/components/private-key-context";
import { importPrivateKey, importPublicKey, signMessage } from "@/utils/crypto";
import { uint8ArrayToBase64 } from "@/utils/utils";
import axios from "axios";
import { useState } from "react";
import Dropzone from "react-dropzone";
import { toast } from "sonner";

export function FileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const { localPrivateKey } = usePrivateKey();

  if (!localPrivateKey) {
    return (
      <div className="p-8 border-2 border-dashed rounded-2xl">
        <p className="font-bold text-gray-200 dark:text-gray-700">
          Enable security to upload files
        </p>
      </div>
    );
  }

  return (
    <Dropzone
      multiple={false}
      maxFiles={1}
      onDrop={async (acceptedFiles) => {
        const file = acceptedFiles[0];
        setUploadProgress(0);
        setUploading(true);

        try {
          if (!localPrivateKey) {
            toast.error("You need to enable security first");
            return;
          }

          const importedPrivateKey = await importPrivateKey(localPrivateKey);
          const signature = await signMessage(
            importedPrivateKey,
            SIGN_TEST_MESSAGE
          );

          const userKeyResult = await getUserKeyAction();
          if (!userKeyResult || userKeyResult.serverError) {
            toast.error("You need to enable security first");
            return;
          }

          const splitted = file.name.split(".");
          const extension =
            splitted.length > 1 ? splitted[splitted.length - 1] : null;

          const result = await getSignedUploadUrlAction({
            fileExtension: extension,
            signature: uint8ArrayToBase64(new Uint8Array(signature)),
            signatureMessage: SIGN_TEST_MESSAGE,
          });
          if (result?.serverError) {
            toast.error(result.serverError);
            return;
          }
          const signedUploadData = result?.data!;

          const fileBuffer = await file.arrayBuffer();
          const aesKey = await crypto.subtle.generateKey(
            {
              name: "AES-GCM",
              length: 256,
            },
            true,
            ["encrypt", "decrypt"]
          );

          const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM

          const encryptedBuffer = await crypto.subtle.encrypt(
            {
              name: "AES-GCM",
              iv,
            },
            aesKey,
            fileBuffer
          );

          const encryptedFileName = await crypto.subtle.encrypt(
            {
              name: "AES-GCM",
              iv,
            },
            aesKey,
            new TextEncoder().encode(file.name)
          );

          const encryptedFileType = await crypto.subtle.encrypt(
            {
              name: "AES-GCM",
              iv,
            },
            aesKey,
            new TextEncoder().encode(file.type)
          );

          const encryptedFileSize = await crypto.subtle.encrypt(
            {
              name: "AES-GCM",
              iv,
            },
            aesKey,
            new TextEncoder().encode(file.size.toString())
          );

          const encryptedFile = new Blob([encryptedBuffer]);

          const rawKey = await crypto.subtle.exportKey("raw", aesKey);

          const importedPublicKey = await importPublicKey(
            userKeyResult.data?.publicKey!
          );

          const encryptedAesKey = await crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            importedPublicKey, // your previously generated/imported public key
            rawKey
          );

          await axios.put(signedUploadData.url, encryptedFile, {
            onUploadProgress: (evt) => {
              const { loaded, total, rate, progress } = evt;
              const progressFormatted = (progress ?? 0) * 100;
              setUploadProgress(progressFormatted);

              console.log(`Uploaded: ${((progress ?? 0) * 100).toFixed(2)}%`);
              console.log(`Speed: ${rate} B/s`);

              if (rate && total) {
                const remaining = total - loaded;
                const estimated = remaining / rate;

                console.log(
                  `Estimated time left: ${estimated.toFixed(2)} seconds`
                );
              }
            },
          });

          const insertResult = await insertUploadedFileAction({
            filePath: signedUploadData.filePath,
            encryptedFileKey: uint8ArrayToBase64(
              new Uint8Array(encryptedAesKey)
            ),
            iv: uint8ArrayToBase64(iv),
            fileInfo: {
              name: uint8ArrayToBase64(new Uint8Array(encryptedFileName)),
              type: uint8ArrayToBase64(new Uint8Array(encryptedFileType)),
              size: uint8ArrayToBase64(new Uint8Array(encryptedFileSize)),
            },
            signature: uint8ArrayToBase64(new Uint8Array(signature)),
            signatureMessage: SIGN_TEST_MESSAGE,
          });

          if (insertResult?.serverError) {
            throw new Error(insertResult.serverError);
          }
        } catch (error) {
          toast.error("Failed to upload file");
          console.error(error);
        }

        setUploading(false);
        setUploadProgress(0);
      }}
    >
      {({ getRootProps, getInputProps }) => (
        <section className="w-full">
          <div
            {...getRootProps()}
            className="p-8 border-2 border-dashed rounded-2xl"
          >
            <input {...getInputProps()} />
            <p>Drag 'n' drop a file here, or click to select file</p>
            {uploading && (
              <p className="font-semibold mt-2">Uploading {uploadProgress}%</p>
            )}
          </div>
        </section>
      )}
    </Dropzone>
  );
}
