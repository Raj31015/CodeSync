import {pgTable,text,unique,timestamp, pgEnum, AnyPgColumn} from "drizzle-orm/pg-core"
import {createInsertSchema} from 'drizzle-zod'
import { relations } from "drizzle-orm"
export const roleEnum=pgEnum("user_role",["viewer","editor","owner"])

export const apps=pgTable("app",{
    appId:text("appId").primaryKey(),
    userId:text("userId").notNull(),
    name:text("name").notNull(),
    createdAt:timestamp("createdAt").defaultNow().notNull(),
    updatedAt:timestamp("updatedAt").defaultNow().notNull(),
    updatedBy:text("updatedBy").notNull(),

},
    (table)=> [
        unique().on(table.name,table.userId)

])

export const folders = pgTable("folders", {
  folderId: text("folderId").primaryKey(),
  name: text("name").notNull(),
  appId:text("appId").references(()=>apps.appId,{onDelete:'cascade'}).notNull(),
  parentId: text("parent_id").references(():AnyPgColumn=>folders.folderId,{onDelete:'cascade'}), // Skip `.references()` for now
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
    userId:text().notNull(),
    app_id:text().references(()=>apps.appId,{onDelete:'cascade'}).notNull(),
    role:roleEnum("role").notNull()
},(table)=>[
  unique().on(table.userId,table.app_id)
])
export const insertAppSchema=createInsertSchema(apps)
export const insertFolderSchema=createInsertSchema(folders)
export const insertFileSchema = createInsertSchema(files);