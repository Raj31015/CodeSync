

ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_app_id_app_appId_fk" FOREIGN KEY ("app_id") REFERENCES "public"."app"("appId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_userId_app_id_unique" UNIQUE("userId","app_id");