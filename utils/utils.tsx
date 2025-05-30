import { FileText, ImageIcon, File } from "lucide-react";

export function arrayBufferToBase64(data: ArrayBuffer): string {
  return uint8ArrayToBase64(new Uint8Array(data));
}

export function uint8ArrayToBase64(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.byteLength; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const formatFileSize = (size: number) => {
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(2)} ${units[i]}`;
};

export const getFileIcon = (fileType: string, size: number) => {
  if (fileType.includes("pdf")) {
    return <FileText className={`h-${size} w-${size} text-red-500 shrink-0`} />;
  } else if (fileType.includes("word") || fileType.includes("document")) {
    return (
      <FileText className={`h-${size} w-${size} text-blue-500 shrink-0`} />
    );
  } else if (fileType.includes("image")) {
    return (
      <ImageIcon className={`h-${size} w-${size} text-green-500 shrink-0`} />
    );
  }
  return <File className={`h-${size} w-${size} shrink-0`} />;
};
