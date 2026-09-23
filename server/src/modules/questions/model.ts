import { Schema, model, type InferSchemaType } from "mongoose";

const optionSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: true },
);

const questionSchema = new Schema(
    {
        poll: {
            type: Schema.Types.ObjectId,
            ref: "Poll",
            required: true,
        },

        text: {
            type: String,
            required: true,
            trim: true,
        },
        options: {
            type: [optionSchema],
            validate: {
                validator: (options: unknown[]) => options.length >= 2,
                message: "Each question must have at least 2 options",
            },
        },

        isRequired: {
            type: Boolean,
            default: true,
        },

        order: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { timestamps: true },
);

questionSchema.index({ poll: 1, order: 1 }, { unique: true });

const Question = model("Question", questionSchema);

export type Question = InferSchemaType<typeof questionSchema>;
export default Question;
