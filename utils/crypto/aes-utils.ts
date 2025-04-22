import { base64ToUint8Array } from "../utils";
import {
  AES_GSM_ALGORITHM,
  AES_KEY_EXPORT_FORMAT,
  AES_KEYGEN_LENGTH,
  SHA_512_ALGORITHM,
} from "./consts";

export async function generateAESGCMKey() {
  return await crypto.subtle.generateKey(
    { name: AES_GSM_ALGORITHM, length: AES_KEYGEN_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportAESKey(aesKey: CryptoKey) {
  return await crypto.subtle.exportKey(AES_KEY_EXPORT_FORMAT, aesKey);
}

export async function importAESKeyForDecrypt(base64Key: string) {
  const binaryKey = base64ToUint8Array(base64Key);
  return await crypto.subtle.importKey(
    AES_KEY_EXPORT_FORMAT,
    binaryKey,
    {
      name: AES_GSM_ALGORITHM,
      length: AES_KEYGEN_LENGTH,
    },
    false,
    ["decrypt"]
  );
}

export async function deriveKeyFromPasswordKey(
  usage: "encrypt" | "decrypt",
  passwordKey: CryptoKey,
  salt: Uint8Array
) {
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 600_000,
      hash: SHA_512_ALGORITHM,
    },
    passwordKey,
    { name: AES_GSM_ALGORITHM, length: AES_KEYGEN_LENGTH },
    false,
    [usage]
  );
}

export async function encryptBufferWithAESGCM(
  iv: Uint8Array,
  aesKey: CryptoKey,
  buffer: ArrayBuffer | Uint8Array
) {
  return await crypto.subtle.encrypt(
    {
      name: AES_GSM_ALGORITHM,
      iv: iv,
    },
    aesKey,
    buffer
  );
}

export async function decryptBufferWithAESGCM(
  iv: Uint8Array,
  aesKey: CryptoKey,
  encryptedBuffer: ArrayBuffer | Uint8Array
) {
  return await crypto.subtle.decrypt(
    {
      name: AES_GSM_ALGORITHM,
      iv: iv,
    },
    aesKey,
    encryptedBuffer
  );
}
