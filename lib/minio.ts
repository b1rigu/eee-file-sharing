import * as Minio from "minio";

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
  useSSL: process.env.MINIO_USE_SSL === "true",
  port: process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : undefined,
});
