
CREATE TABLE "app" (
	"appId" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_name_userId_unique" UNIQUE("name","userId")
);
--> statement-breakpoint
CREATE TABLE "collaborators" (
	"userId" text NOT NULL,
	"app_id" text,
	"role" "user_role" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"fileId" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"folder_id" text,
	"app_id" text NOT NULL,
	"content" text,
	"language" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "files_name_folder_id_unique" UNIQUE("name","folder_id")
);
--> statement-breakpoint
CREATE TABLE "folders" (
	"folderId" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parent_id" text
);
--> statement-breakpoint
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_app_id_app_appId_fk" FOREIGN KEY ("app_id") REFERENCES "public"."app"("appId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_folder_id_folders_folderId_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("folderId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_app_id_app_appId_fk" FOREIGN KEY ("app_id") REFERENCES "public"."app"("appId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_parent_id_folders_folderId_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."folders"("folderId") ON DELETE no action ON UPDATE no action;