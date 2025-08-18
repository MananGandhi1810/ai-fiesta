import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

console.log(process.env)

export default defineConfig({
    schema: "./src/lib/schema.js",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});
