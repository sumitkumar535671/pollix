import z from "zod";
import { mongoIdSchema } from "../../shared/schemas/mongoId.js";

export const pollIdParamSchema = z.object({
    params: z.strictObject({
        pollId:mongoIdSchema,
    }),
});

export type PollIdParamSchemaType = z.infer<typeof pollIdParamSchema>;
