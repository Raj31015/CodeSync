import { defineConfig } from "drizzle-kit";
import {config} from 'dotenv'
config({path:".env.local"})
export default defineConfig({
  dialect: 'postgresql', // 'mysql' | 'sqlite' | 'turso'
  schema: './db/schema.ts',
  dbCredentials:{
    url:process.env.DATABASE_URL!
  }
 
})
