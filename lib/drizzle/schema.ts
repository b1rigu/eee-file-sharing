import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  AnyPgColumn,
  unique,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  sharedFiles: many(sharedFiles),
}));

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

export const dataNodes = pgTable(
  "data_nodes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    parentId: text("parent_id").references((): AnyPgColumn => dataNodes.id, {
      onDelete: "cascade",
    }),
    type: text("type", { enum: ["file", "folder"] }).notNull(),
    nameHash: text("name_hash").notNull(),
    encryptedName: text("encrypted_name").notNull(),
    encryptedKey: text("encrypted_key").notNull(),
    iv: text("iv").notNull(),

    fileKey: text("file_key"),
    encryptedType: text("encrypted_type"),
    encryptedSize: text("encrypted_size"),

    createdAt: timestamp("created_at").notNull(),
  },
  (t) => [
    unique("data_nodes_unique")
      .on(t.userId, t.parentId, t.type, t.nameHash)
      .nullsNotDistinct(),
  ]
);

export const dataNodesRelations = relations(dataNodes, ({ many }) => ({
  sharedFiles: many(sharedFiles),
}));

export const sharedFiles = pgTable(
  "shared_files",
  {
    id: text("id").primaryKey(),
    receiverId: text("receiver_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    dataNodeId: text("data_node_id")
      .notNull()
      .references(() => dataNodes.id, { onDelete: "cascade" }),
    encryptedKey: text("encrypted_key").notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (t) => [
    unique("shared_files_unique")
      .on(t.receiverId, t.dataNodeId)
      .nullsNotDistinct(),
  ]
);

export const sharedFilesRelations = relations(sharedFiles, ({ one }) => ({
  dataNodes: one(dataNodes, {
    fields: [sharedFiles.dataNodeId],
    references: [dataNodes.id],
  }),
  receiver: one(user, {
    fields: [sharedFiles.receiverId],
    references: [user.id],
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
  encryptedPrivateKeyRecovery: text("encrypted_private_key_recovery").notNull(),
  recoverySalt: text("recovery_salt").notNull(),
  recoveryIv: text("recovery_iv").notNull(),
  createdAt: timestamp("created_at").notNull(),
});
