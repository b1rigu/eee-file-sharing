import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, unique } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const uploadedFiles = pgTable("uploaded_files", {
  id: text("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: text("file_size").notNull(),
  filePath: text("file_path").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const uploadedFilesRelations = relations(uploadedFiles, ({ many }) => ({
  fileAccess: many(fileAccess),
}));

export const fileAccess = pgTable(
  "file_access",
  {
    id: text("id").primaryKey(),
    fileId: text("file_id")
      .notNull()
      .references(() => uploadedFiles.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    encryptedFileKey: text("encrypted_file_key").notNull(),
    iv: text("iv").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (t) => [unique().on(t.fileId, t.userId)]
);

export const fileAccessRelations = relations(fileAccess, ({ one }) => ({
  author: one(uploadedFiles, {
    fields: [fileAccess.fileId],
    references: [uploadedFiles.id],
  }),
}));

export const userKeys = pgTable("user_keys", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  publicKey: text("public_key").notNull(),
  encryptedPrivateKey: text("encrypted_private_key").notNull(),
  salt: text("salt").notNull(),
  iv: text("iv").notNull(),
  createdAt: timestamp("created_at").notNull(),
});
