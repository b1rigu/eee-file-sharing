ALTER TABLE "user_keys" ADD COLUMN "encrypted_private_key_recovery" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_keys" ADD COLUMN "recovery_salt" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_keys" ADD COLUMN "recovery_iv" text NOT NULL;