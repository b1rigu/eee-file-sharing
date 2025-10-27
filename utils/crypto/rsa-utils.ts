import { base64ToUint8Array, uint8ArrayToBase64 } from "../utils";
import {
  RSA_ENCRYPTION_AND_DECRYPTION_ALGORITHM,
  RSA_KEY_SIZE,
  RSA_PRIVATE_KEY_EXPORT_FORMAT,
  RSA_PUBLIC_KEY_EXPORT_FORMAT,
  RSA_SIGNING_AND_VERIFICATION_ALGORITHM,
  SHA_512_ALGORITHM,
} from "./consts";

export async function generateRSAKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: RSA_ENCRYPTION_AND_DECRYPTION_ALGORITHM,
      modulusLength: RSA_KEY_SIZE,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
      hash: SHA_512_ALGORITHM,
    },
    true,
    ["encrypt", "decrypt"]
  );

  return keyPair;
}

async function importRSAPublicKeyToEncrypt(
  base64Key: string
): Promise<CryptoKey> {
  const binaryKey = base64ToUint8Array(base64Key);
  return await crypto.subtle.importKey(
    RSA_PUBLIC_KEY_EXPORT_FORMAT,
    binaryKey,
    {
      name: RSA_ENCRYPTION_AND_DECRYPTION_ALGORITHM,
      hash: SHA_512_ALGORITHM,
    },
    true,
    ["encrypt"]
  );
}

export async function importRSAPublicKeyToVerify(
  base64Key: string
): Promise<CryptoKey> {
  const binaryKey = base64ToUint8Array(base64Key);
  return await crypto.subtle.importKey(
    RSA_PUBLIC_KEY_EXPORT_FORMAT,
    binaryKey,
    {
      name: RSA_SIGNING_AND_VERIFICATION_ALGORITHM,
      hash: SHA_512_ALGORITHM,
    },
    true,
    ["verify"]
  );
}

export async function exportRSAPublicKey(publicKey: CryptoKey) {
  return await crypto.subtle.exportKey(RSA_PUBLIC_KEY_EXPORT_FORMAT, publicKey);
}

export async function importRSAPrivateKeyToSign(base64Key: string) {
  const binaryKey = base64ToUint8Array(base64Key);
  return await crypto.subtle.importKey(
    RSA_PRIVATE_KEY_EXPORT_FORMAT,
    binaryKey,
    {
      name: RSA_SIGNING_AND_VERIFICATION_ALGORITHM,
      hash: SHA_512_ALGORITHM,
    },
    true,
    ["sign"]
  );
}

export async function importRSAPrivateKeyToDecrypt(base64Key: string) {
  const binaryKey = base64ToUint8Array(base64Key);
  return await crypto.subtle.importKey(
    RSA_PRIVATE_KEY_EXPORT_FORMAT,
    binaryKey,
    {
      name: RSA_ENCRYPTION_AND_DECRYPTION_ALGORITHM,
      hash: SHA_512_ALGORITHM,
    },
    true,
    ["decrypt"]
  );
}

export async function exportRSAPrivateKey(privateKey: CryptoKey) {
  return await crypto.subtle.exportKey(
    RSA_PRIVATE_KEY_EXPORT_FORMAT,
    privateKey
  );
}

export async function encryptBufferWithRSAPublicKey(
  buffer: ArrayBuffer | Uint8Array<ArrayBuffer>,
  RSAPublicKey: string
) {
  const importedPublicKey = await importRSAPublicKeyToEncrypt(RSAPublicKey);
  return await crypto.subtle.encrypt(
    { name: RSA_ENCRYPTION_AND_DECRYPTION_ALGORITHM },
    importedPublicKey,
    buffer
  );
}

export async function decryptBufferWithRSAPrivateKey(
  buffer: ArrayBuffer | Uint8Array<ArrayBuffer>,
  RSAPrivateKey: string
) {
  const importedPrivateKey = await importRSAPrivateKeyToDecrypt(RSAPrivateKey);
  return await crypto.subtle.decrypt(
    { name: RSA_ENCRYPTION_AND_DECRYPTION_ALGORITHM },
    importedPrivateKey,
    buffer
  );
}
