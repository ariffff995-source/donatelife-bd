ALTER TABLE "users" ADD COLUMN "donor_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "show_phone" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_donor_id_unique" UNIQUE("donor_id");