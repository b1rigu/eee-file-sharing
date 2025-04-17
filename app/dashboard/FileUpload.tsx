"use client";

import { getSignedUploadUrlAction } from "@/actions/get-signed-upload-url";
import { getUserKeyAction } from "@/actions/get-user-key";
import { insertUploadedFileAction } from "@/actions/insert-uploaded-file";
import {
  importPrivateKey,
  importPublicKey,
  signMessage,
  uint8ArrayToBase64,
} from "@/utils/crypto";
import Dropzone from "react-dropzone";

export function FileUpload() {
  return (
    <Dropzone
      multiple={false}
      maxFiles={1}
      onDrop={async (acceptedFiles) => {
        const file = acceptedFiles[0];

        try {
          const localPrivateKey = localStorage.getItem("privateKey");
          if (!localPrivateKey) {
            alert("You need to enable security first");
            return;
          }

          const importedPrivateKey = await importPrivateKey(localPrivateKey);
          const signature = await signMessage(importedPrivateKey, "hello");

          const userKeyResult = await getUserKeyAction();
          if (!userKeyResult || userKeyResult.serverError) {
            alert("You need to enable security first");
            return;
          }

          const result = await getSignedUploadUrlAction({
            fileName: file.name,
            signature: uint8ArrayToBase64(new Uint8Array(signature)),
            signatureMessage: "hello",
          });
          if (result?.serverError) {
            alert(result.serverError);
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

          await fetch(signedUploadData.url, {
            method: "PUT",
            body: encryptedFile,
          });

          const insertResult = await insertUploadedFileAction({
            filePath: signedUploadData.filePath,
            encryptedFileKey: uint8ArrayToBase64(
              new Uint8Array(encryptedAesKey)
            ),
            iv: uint8ArrayToBase64(iv),
            fileInfo: {
              name: file.name,
              type: file.type,
              size: file.size.toString(),
            },
            signature: uint8ArrayToBase64(new Uint8Array(signature)),
            signatureMessage: "hello",
          });

          if (insertResult?.serverError) {
            throw new Error(insertResult.serverError);
          }
        } catch (error) {
          alert("Failed to upload file");
          console.error(error);
        }
      }}
    >
      {({ getRootProps, getInputProps }) => (
        <section>
          <div
            {...getRootProps()}
            className="p-8 border-2 border-dashed rounded-2xl"
          >
            <input {...getInputProps()} />
            <p>Drag 'n' drop some files here, or click to select files</p>
          </div>
        </section>
      )}
    </Dropzone>
  );
}
