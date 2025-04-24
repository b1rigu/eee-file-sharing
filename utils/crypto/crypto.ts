import {
  RSA_SIGNING_AND_VERIFICATION_ALGORITHM,
  RSA_SIGN_SALT_LENGTH,
  IV_LENGTH,
  ENCRYPTION_CHUNK_SIZE,
  SALT_LENGTH,
  SIGN_TEST_MESSAGE,
  SHA_512_ALGORITHM,
} from "./consts";
import { arrayBufferToBase64, base64ToUint8Array, uint8ArrayToBase64 } from "../utils";
import {
  encryptBufferWithRSAPublicKey,
  exportRSAPrivateKey,
  importRSAPrivateKeyToDecrypt,
  importRSAPrivateKeyToSign,
  importRSAPublicKeyToVerify,
} from "./rsa-utils";
import {
  decryptBufferWithAESGCM,
  deriveKeyFromPasswordKey,
  encryptBufferWithAESGCM,
  exportAESKey,
  generateAESGCMKey,
  importAESKeyForDecrypt,
} from "./aes-utils";

function generateIV() {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH)); // 96-bit IV
}

function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

export async function generateTextHash(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(SHA_512_ALGORITHM, data);
  return arrayBufferToBase64(hashBuffer);
}

export async function encryptTextWithPublicKey(text: string, RSAPublicKey: string) {
  const aesKey = await generateAESGCMKey();
  const textBuffer = new TextEncoder().encode(text);
  const iv = generateIV();
  const ivString = uint8ArrayToBase64(iv);

  const rawKey = await exportAESKey(aesKey);
  const encryptedAesKeyBuffer = await encryptBufferWithRSAPublicKey(rawKey, RSAPublicKey);
  const encryptedAesKey = arrayBufferToBase64(encryptedAesKeyBuffer);

  const encryptedTextBuffer = await encryptBufferWithAESGCM(iv, aesKey, textBuffer);
  const encryptedText = arrayBufferToBase64(encryptedTextBuffer);

  return {
    encryptedAesKey,
    iv: ivString,
    encryptedText,
  };
}

export async function encryptBlobWithMetaAESGCM(
  blob: Blob,
  fileName: string,
  fileType: string,
  fileSize: number,
  RSAPublicKey: string
) {
  const aesKey = await generateAESGCMKey();
  const encryptedChunks: Uint8Array[] = [];
  const fileBuffer = await blob.arrayBuffer();
  const fileBytes = new Uint8Array(fileBuffer);

  for (let offset = 0; offset < fileBytes.length; offset += ENCRYPTION_CHUNK_SIZE) {
    const chunk = fileBytes.slice(offset, offset + ENCRYPTION_CHUNK_SIZE);

    const iv = generateIV();
    const encrypted = await encryptBufferWithAESGCM(iv, aesKey, chunk);

    const encryptedBytes = new Uint8Array(encrypted);

    // Store as: [IV (12 bytes)] + [ciphertext + authTag]
    const result = new Uint8Array(iv.length + encryptedBytes.length);
    result.set(iv, 0);
    result.set(encryptedBytes, iv.length);

    encryptedChunks.push(result);
  }

  const encryptedBlob = new Blob(encryptedChunks);

  const rawKey = await exportAESKey(aesKey);
  const encryptedAesKeyBuffer = await encryptBufferWithRSAPublicKey(rawKey, RSAPublicKey);
  const encryptedAesKey = arrayBufferToBase64(encryptedAesKeyBuffer);

  const metaIV = generateIV();

  const encryptedFileNameBuffer = await encryptBufferWithAESGCM(
    metaIV,
    aesKey,
    new TextEncoder().encode(fileName)
  );
  const encryptedFileName = arrayBufferToBase64(encryptedFileNameBuffer);

  const encryptedFileTypeBuffer = await encryptBufferWithAESGCM(
    metaIV,
    aesKey,
    new TextEncoder().encode(fileType)
  );
  const encryptedFileType = arrayBufferToBase64(encryptedFileTypeBuffer);

  const encryptedFileSizeBuffer = await encryptBufferWithAESGCM(
    metaIV,
    aesKey,
    new TextEncoder().encode(fileSize.toString())
  );
  const encryptedFileSize = arrayBufferToBase64(encryptedFileSizeBuffer);

  const iv = uint8ArrayToBase64(metaIV);

  const nameHash = await generateTextHash(fileName);

  return {
    encryptedAesKey,
    iv,
    encryptedBlob,
    encryptedFileName,
    encryptedFileType,
    encryptedFileSize,
    nameHash,
  };
}

export async function decryptAndSaveWithAESGCM(
  fileUrl: string,
  base64AesKey: string,
  outputFileName: string,
  fileSize: number
) {
  if (typeof window === "undefined") return;

  const streamSaver = (await import("streamsaver")).default;

  const response = await fetch(fileUrl);

  if (!response.body) {
    console.error("No response body for streaming");
    return;
  }

  const readableStream = response.body;
  const aesKey = await importAESKeyForDecrypt(base64AesKey);

  let leftover = new Uint8Array();
  const encryptedChunkSize = IV_LENGTH + ENCRYPTION_CHUNK_SIZE + 16;
  const decryptStream = new TransformStream<Uint8Array, Uint8Array>({
    start() {},
    async transform(chunk, controller) {
      leftover = concatUint8Arrays(leftover, chunk);

      while (leftover.length >= encryptedChunkSize) {
        const currentChunk = leftover.slice(0, encryptedChunkSize);
        const iv = currentChunk.slice(0, IV_LENGTH);
        const ciphertextWithTag = currentChunk.slice(IV_LENGTH);

        try {
          const decrypted = await decryptBufferWithAESGCM(iv, aesKey, ciphertextWithTag);

          controller.enqueue(new Uint8Array(decrypted));
        } catch (e) {
          console.error("Decryption failed", e);
          throw e;
        }

        leftover = leftover.slice(encryptedChunkSize);
      }
    },
    async flush(controller) {
      if (leftover.length > 0) {
        // Try to decrypt a smaller final chunk
        if (leftover.length >= IV_LENGTH + 16) {
          const iv = leftover.slice(0, IV_LENGTH);
          const ciphertextWithTag = leftover.slice(IV_LENGTH);

          try {
            const decrypted = await decryptBufferWithAESGCM(iv, aesKey, ciphertextWithTag);
            controller.enqueue(new Uint8Array(decrypted));
          } catch (e) {
            console.error("Final chunk decryption failed", e);
            throw e;
          }
        } else {
          console.warn("Not enough bytes for final chunk");
        }
      }
    },
  });

  const fileStream = streamSaver.createWriteStream(outputFileName, {
    size: fileSize,
  });

  try {
    await readableStream.pipeThrough(decryptStream).pipeTo(fileStream);
  } catch (err) {
    console.error("Decryption stream failed:", err);
  }
}

function concatUint8Arrays(a: Uint8Array, b: Uint8Array) {
  const result = new Uint8Array(a.length + b.length);
  result.set(a);
  result.set(b, a.length);
  return result;
}

export async function signMessageWithRSA(RSAPrivateKey: string): Promise<ArrayBuffer> {
  const importedPrivateKey = await importRSAPrivateKeyToSign(RSAPrivateKey);
  const data = new TextEncoder().encode(SIGN_TEST_MESSAGE);
  return await crypto.subtle.sign(
    {
      name: RSA_SIGNING_AND_VERIFICATION_ALGORITHM,
      saltLength: RSA_SIGN_SALT_LENGTH,
    },
    importedPrivateKey,
    data
  );
}

export async function verifyRSASignedMessage(signature: string, RSAPublicKey: string) {
  const importedPublicKey = await importRSAPublicKeyToVerify(RSAPublicKey);

  const isValid = await crypto.subtle.verify(
    {
      name: RSA_SIGNING_AND_VERIFICATION_ALGORITHM,
      saltLength: RSA_SIGN_SALT_LENGTH,
    },
    importedPublicKey,
    base64ToUint8Array(signature),
    new TextEncoder().encode(SIGN_TEST_MESSAGE)
  );

  return isValid;
}

async function getKeyFromPassword(password: string) {
  return await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
}

export async function encryptPrivateKeyWithPassword(privateKey: CryptoKey, password: string) {
  const exportedPrivateKey = await exportRSAPrivateKey(privateKey);

  const salt = generateSalt();
  const iv = generateIV();

  const passwordKey = await getKeyFromPassword(password);

  const aesKey = await deriveKeyFromPasswordKey("encrypt", passwordKey, salt);

  const encrypted = await encryptBufferWithAESGCM(iv, aesKey, exportedPrivateKey);

  return {
    encryptedPrivateKey: uint8ArrayToBase64(new Uint8Array(encrypted)),
    salt: uint8ArrayToBase64(salt),
    iv: uint8ArrayToBase64(iv),
  };
}

export async function decryptPrivateKeyWithPassword(
  encryptedPrivateKey: string,
  password: string,
  salt: string,
  iv: string
): Promise<CryptoKey> {
  const encryptedPrivateKeyBytes = base64ToUint8Array(encryptedPrivateKey);
  const saltBytes = base64ToUint8Array(salt);
  const ivBytes = base64ToUint8Array(iv);

  const passwordKey = await getKeyFromPassword(password);

  const aesKey = await deriveKeyFromPasswordKey("decrypt", passwordKey, saltBytes);

  const decryptedKeyBuffer = await decryptBufferWithAESGCM(
    ivBytes,
    aesKey,
    encryptedPrivateKeyBytes
  );

  return await importRSAPrivateKeyToDecrypt(arrayBufferToBase64(decryptedKeyBuffer));
}
