import * as Minio from "minio";

let minioConfig: Minio.ClientOptions = {
  endPoint: process.env.MINIO_ENDPOINT!,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
  useSSL: process.env.NODE_ENV === "development" ? false : true,
};

if (process.env.NODE_ENV === "development") {
  minioConfig.port = Number(process.env.MINIO_PORT);
}

export const minioClient = new Minio.Client(minioConfig);
