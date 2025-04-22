type CompressionOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
};

export async function compressImage(
  file: File | Blob,
  { maxWidth = 512, maxHeight = 512, quality = 0.75 }: CompressionOptions
): Promise<Blob> {
  const img = new Image();
  img.src = URL.createObjectURL(file);

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  URL.revokeObjectURL(img.src);

  // Resize while preserving aspect ratio
  let { width, height } = img;
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  width = width * scale;
  height = height * scale;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  if (ctx.imageSmoothingEnabled && ctx.imageSmoothingQuality) {
    ctx.imageSmoothingQuality = "high";
  }

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/jpeg", quality)
  );

  if (!blob) throw new Error("Failed to generate");

  return blob;
}
