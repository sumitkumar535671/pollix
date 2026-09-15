import "dotenv/config";
import {z} from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    MONGODB_URL:z.url(),
    CLIENT_URL:z.url(),
    CLERK_PUBLISHABLE_KEY: z.string(),
    CLERK_SECRET_KEY: z.string(),
});

