import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "@/db/schema"

// Use a dummy URL during build time to avoid neon() throwing on missing env var.
// At runtime, DATABASE_URL must be set for actual database operations.
const databaseUrl =
  process.env.DATABASE_URL || "postgresql://build:build@localhost/build"
const sql = neon(databaseUrl)
export const db = drizzle(sql, { schema })
