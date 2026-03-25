import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "@/db/schema"

const databaseUrl =
  process.env.DATABASE_URL || "postgresql://build:build@localhost/build"
const client = postgres(databaseUrl)
export const db = drizzle(client, { schema })
