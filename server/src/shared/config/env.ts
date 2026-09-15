import "dotenv/config";
import {z} from "zod";

const envSchema = z.object({
    INNGEST_DEV:z.coerce.number().int().default(1),
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    MONGODB_URL:z.url(),
    CLIENT_URL:z.url(),
    CLERK_PUBLISHABLE_KEY: z.string(),
    CLERK_SECRET_KEY: z.string(),
});

function createEnv(env:NodeJS.ProcessEnv){
    const safeParseResult = envSchema.safeParse(env);
    if(!safeParseResult.success){
        throw new Error(safeParseResult.error.message);
    }
    return safeParseResult.data;
}

const env = createEnv(process.env);
export default env;
