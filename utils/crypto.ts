import { base64ToUint8Array, uint8ArrayToBase64 } from "./utils";

export async function generateRsaKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  return keyPair;
}

export async function importPublicKey(base64Key: string): Promise<CryptoKey> {
  const binaryKey = base64ToUint8Array(base64Key);
  return await crypto.subtle.importKey(
    "spki",
    binaryKey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("spki", publicKey);
  return uint8ArrayToBase64(new Uint8Array(exported));
}

export async function importPrivateKey(base64Key: string): Promise<CryptoKey> {
  const binaryKey = base64ToUint8Array(base64Key);
  return await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    },
    true,
    ["sign"]
  );
}

export async function importDecryptPrivateKey(
  base64Key: string
): Promise<CryptoKey> {
  const binaryKey = base64ToUint8Array(base64Key);
  return await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
}

export async function exportPrivateKey(
  privateKey: CryptoKey
): Promise<ArrayBuffer> {
  return await crypto.subtle.exportKey("pkcs8", privateKey); // you'll encrypt this using AES
}

export async function encryptPrivateKeyWithPasswordBase64(
  privateKey: CryptoKey,
  password: string
) {
  const pkcs8 = await exportPrivateKey(privateKey);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    pkcs8
  );

  return {
    encryptedPrivateKey: uint8ArrayToBase64(new Uint8Array(encrypted)),
    salt: uint8ArrayToBase64(salt),
    iv: uint8ArrayToBase64(iv),
  };
}

export async function decryptPrivateKeyWithPassword(
  encryptedPrivateKey: Uint8Array,
  password: string,
  salt: Uint8Array,
  iv: Uint8Array
): Promise<CryptoKey> {
  // 1. Derive AES key from password and salt
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["decrypt"]
  );

  // 2. Decrypt private key
  const decryptedKeyBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    encryptedPrivateKey
  );

  // 3. Import the decrypted private key
  return await crypto.subtle.importKey(
    "pkcs8",
    decryptedKeyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
}

export async function signMessage(
  privateKey: CryptoKey,
  message: string
): Promise<ArrayBuffer> {
  const data = new TextEncoder().encode(message);
  return await crypto.subtle.sign(
    {
      name: "RSA-PSS",
      saltLength: 32,
    },
    privateKey,
    data
  );
}
