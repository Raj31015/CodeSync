import {pgTable,text,unique,timestamp, pgEnum, AnyPgColumn,boolean} from "drizzle-orm/pg-core"
import {createInsertSchema} from 'drizzle-zod'
import { relations } from "drizzle-orm"
export const roleEnum=pgEnum("user_role",["viewer","editor","owner"])

export const apps=pgTable("app",{
    appId:text("appId").primaryKey(),
    userId:text("userId").notNull(),
    name:text("name").notNull(),
    createdAt:timestamp("createdAt",{withTimezone:true}).defaultNow().notNull().$type<Date>(),
    updatedAt:timestamp("updatedAt",{withTimezone:true}).defaultNow().notNull().$type<Date>(),
    updatedBy:text("updatedBy").notNull(),

},
    (table)=> [
        unique().on(table.name,table.userId)

])

export const folders = pgTable("folders", {
  folderId: text("folderId").primaryKey(),
  name: text("name").notNull(),
  appId:text("appId").references(()=>apps.appId,{onDelete:'cascade'}).notNull(),
  parentId: text("parent_id").references(():AnyPgColumn=>folders.folderId,{onDelete:'cascade'}), 
});

export const folderRelations = relations(
        folders,
    ({ one, many }) => ({
        underlying: one(folders, {
            fields: [folders.parentId],
            references: [folders.folderId],
        }),
    })
);

// files table
export const files = pgTable("files", {
  fileId: text("fileId").primaryKey(),
  name: text("name").notNull(),
  folderId: text("folder_id").references(() => folders.folderId,{onDelete:'cascade'}), // nullable for root-level files
  appId: text("app_id").references(() => apps.appId,{onDelete:'cascade'}).notNull(),
  content: text("content").$default(()=>""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  unique().on(table.name, table.folderId), // allows same name in different folders
]);

export const collaborators=pgTable("collaborators",{
    collabId:text().primaryKey(),
    userId:text().notNull(),
    app_id:text().references(()=>apps.appId,{onDelete:'cascade'}).notNull(),
    role:roleEnum("role").notNull()
},(table)=>[
  unique().on(table.userId,table.app_id)
])
export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "declined",
  "expired",
]);

export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  fromUserId: text("from_user_id").notNull(),
  toUserId: text("to_user_id").notNull(),
  projectId: text("project_id").notNull().references(() => apps.appId),
  // role offered to the invited user for this project
  role: roleEnum("role").notNull().default("viewer"),
  status: invitationStatusEnum("status").default("pending"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "accepted",
  "declined",
]);

export const joinRequests = pgTable("join_requests", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), 
  projectId: text("project_id").notNull().references(() => apps.appId),
  // requested role for this project (used when accepted)
  role: roleEnum("role").notNull().default("viewer"),
  status: requestStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), 
  type: text("type").notNull(),
  referenceId: text("reference_id"), 
  message: text("message"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertAppSchema=createInsertSchema(apps)
export const insertFolderSchema=createInsertSchema(folders)
export const insertFileSchema = createInsertSchema(files);
export const insertCollabSchema = createInsertSchema(collaborators);