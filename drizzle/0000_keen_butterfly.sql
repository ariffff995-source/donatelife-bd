CREATE TABLE "activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"admin_username" text NOT NULL,
	"admin_role" text NOT NULL,
	"action" text NOT NULL,
	"details" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "ambulances" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"division" text NOT NULL,
	"district" text NOT NULL,
	"upazila" text NOT NULL,
	"police_station" text,
	"address" text NOT NULL,
	"contact_phone" text NOT NULL,
	"service_area" text,
	"available_types" jsonb NOT NULL,
	"opening_hours" text,
	"provider" text,
	"is_available_247" boolean DEFAULT true NOT NULL,
	"whatsapp" text,
	"google_maps_link" text,
	"average_response_time" text,
	"image_url" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"driver_name" text,
	"org_logo_url" text,
	"vehicle_number" text,
	"starting_fare" integer,
	"payment_methods" jsonb,
	"emergency_contact_person" text,
	"live_status" text DEFAULT 'Available' NOT NULL,
	"average_rating" text DEFAULT '5.0' NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"reviews" jsonb,
	"coverage_radius" integer,
	"is_featured" boolean DEFAULT false NOT NULL,
	"total_calls" integer DEFAULT 0 NOT NULL,
	"total_wa_clicks" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"tags" jsonb NOT NULL,
	"featured_image_idea" text NOT NULL,
	"en" jsonb NOT NULL,
	"bn" jsonb NOT NULL,
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blood_banks" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"division" text NOT NULL,
	"district" text NOT NULL,
	"upazila" text NOT NULL,
	"police_station" text,
	"address" text NOT NULL,
	"contact_phone" text NOT NULL,
	"available_groups" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cms_content" (
	"id" text PRIMARY KEY NOT NULL,
	"draft" jsonb NOT NULL,
	"published" jsonb,
	"is_published" boolean DEFAULT true NOT NULL,
	"updated_by" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipient_name" text NOT NULL,
	"blood_group" text NOT NULL,
	"donation_date" text NOT NULL,
	"hospital_name" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hospitals" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"division" text NOT NULL,
	"district" text NOT NULL,
	"upazila" text NOT NULL,
	"police_station" text,
	"address" text NOT NULL,
	"contact_phone" text NOT NULL,
	"services" jsonb NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"uploaded_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"type" text NOT NULL,
	"related_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"patient_name" text NOT NULL,
	"blood_group" text NOT NULL,
	"units_needed" integer NOT NULL,
	"hospital_name" text NOT NULL,
	"division" text NOT NULL,
	"district" text NOT NULL,
	"upazila" text NOT NULL,
	"police_station" text,
	"contact_phone" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"required_date" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"blood_group" text NOT NULL,
	"division" text NOT NULL,
	"district" text NOT NULL,
	"upazila" text NOT NULL,
	"police_station" text,
	"last_donation_date" text,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"avatar_url" text,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"is_phone_verified" boolean DEFAULT false NOT NULL,
	"is_donor_verified" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" text,
	"verified_by" text,
	"verification_note" text,
	"verification_document" text,
	"verification_status" text DEFAULT 'none' NOT NULL,
	"facebook_url" text,
	"show_facebook" boolean DEFAULT false NOT NULL,
	"gender" text,
	"address" text,
	"password" text,
	"favorite_ambulances" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;