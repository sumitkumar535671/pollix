import {z} from "zod";
import { mongoIdSchema } from "../../shared/schemas/mongoId.js";

const answerSchema = z.strictObject(
    {
        question:mongoIdSchema,
        selectedOption: mongoIdSchema,
    },
    {
        error:(issue)=> 
            issue.input === undefined
                ?"Answer is required"
                :"Answer must be an object",
    },
);

export const postResponseSchema = z.object({
    params:z.strictObject({
        pollId:mongoIdSchema,
    }),

    body: z.strictObject({
        answers:z.array(answerSchema,{
            error: (issue) =>
                        issue.input === undefined
                            ? "Answers are required"
                            : "Answers must be an array",
        })
        .min(1, "At least one answer is required")
        .refine(
                (answers) =>
                    new Set(answers.map((answer) => answer.question))
                        .size === answers.length,
                    {
                        message:"Duplicate answers for the same question are not allowed",
                    },
                ),
    },
    {
            error: (issue) =>
                issue.input === undefined
                    ? "Body is required"
                    : "Body must be an object",
    },
)
});

export type PostResponseSchemaType = z.infer<typeof postResponseSchema>;

