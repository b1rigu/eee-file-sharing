import { dataNodes, sharedFiles, user } from "@/lib/drizzle/schema";

export type UserData = typeof dataNodes.$inferSelect & {
  sharedFiles: (typeof sharedFiles.$inferSelect & {
    receiver: {
      email: string;
      image: string | null;
      name: string;
    };
  })[];
};

export type SharedFileType = {
  fileId: string;
  createdAt: Date;
  encryptedKey: string;
  encryptedName: string;
  encryptedType: string;
  encryptedSize: string;
  fileKey: string;
  iv: string;
  sender: {
    email: string;
    image: string | null;
    name: string;
  };
};
