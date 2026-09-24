import { useState } from "react";
import { useNavigate } from "react-router";
import {
    useForm,
    useFieldArray,
    type Control,
    type FieldErrors,
    type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { createPoll } from "../api";
import { getApiErrorMessage } from "../../../shared/lib/api";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../../shared/components/Card";

const optionSchema = z.object({
    value: z.string().min(1, "Option text is required"),
});

const questionSchema = z.object({
    text: z.string().min(1, "Question text is required"),
    isRequired: z.boolean(),
    options: z.array(optionSchema).min(2, "At least 2 options are required"),
});

const pollSchema = z
    .object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        responseAccess: z.enum(["anonymous", "authenticated"]),
        expiresAt: z
            .string()
            .min(1, "Expiry date is required")
            .refine((value) => new Date(value).getTime() > Date.now(), {
                message: "Expiry date must be in the future",
            }),
        questions: z
            .array(questionSchema)
            .min(1, "At least 1 question is required"),
    })
    .refine(
        (data) => {
            return data.questions.some((q) => q.isRequired);
        },
        {
            message: "At least one question must be required",
            path: ["questions"],
        },
    );

type PollFormValues = z.infer<typeof pollSchema>;

export default function CreatePollPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<PollFormValues>({
        resolver: zodResolver(pollSchema),
        defaultValues: {
            title: "",
            description: "",
            responseAccess: "anonymous",
            expiresAt: tomorrow.toISOString().split("T")[0] + "T12:00",
            questions: [
                {
                    text: "",
                    isRequired: true,
                    options: [{ value: "" }, { value: "" }],
                },
            ],
        },
    });

    const {
        fields: questions,
        append: appendQuestion,
        remove: removeQuestion,
    } = useFieldArray({
        name: "questions",
        control,
    });

    const onSubmit = async (data: PollFormValues) => {
        try {
            setIsSubmitting(true);
            const payload = {
                title: data.title,
                description: data.description ? data.description : undefined,
                responseAccess: data.responseAccess,
                expiresAt: new Date(data.expiresAt).toISOString(),
                questions: data.questions.map((q) => ({
                    text: q.text,
                    isRequired: q.isRequired,
                    options: q.options.map((o) => o.value),
                })),
            };

            await createPoll(payload);
            toast.success("Poll created successfully!");
            navigate(`/dashboard`);
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Failed to create poll"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">
                    Create a New Poll
                </h1>
                <p className="text-muted-foreground mt-2">
                    Design your questions and configure settings.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Title
                            </label>
                            <Input
                                placeholder="E.g. Weekly Team Feedback"
                                {...register("title")}
                                error={errors.title?.message}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Description (Optional)
                            </label>
                            <textarea
                                {...register("description")}
                                placeholder="Briefly describe the purpose of this poll"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Access Control
                                </label>
                                <select
                                    {...register("responseAccess")}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="anonymous">
                                        Anonymous (Anyone with link)
                                    </option>
                                    <option value="authenticated">
                                        Authenticated (Sign in required)
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Expiry Date & Time
                                </label>
                                <Input
                                    type="datetime-local"
                                    {...register("expiresAt")}
                                    error={errors.expiresAt?.message}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Questions</h2>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                appendQuestion({
                                    text: "",
                                    isRequired: true,
                                    options: [{ value: "" }, { value: "" }],
                                })
                            }
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Question
                        </Button>
                    </div>

                    {errors.questions?.message && (
                        <p className="text-sm text-destructive">
                            {errors.questions.message}
                        </p>
                    )}

                    {questions.map((question, qIndex) => (
                        <QuestionEditor
                            key={question.id}
                            qIndex={qIndex}
                            control={control}
                            register={register}
                            removeQuestion={() => removeQuestion(qIndex)}
                            errors={errors}
                        />
                    ))}
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                    >
                        {isSubmitting ? "Creating..." : "Create Poll"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

interface QuestionEditorProps {
    qIndex: number;
    control: Control<PollFormValues>;
    register: UseFormRegister<PollFormValues>;
    removeQuestion: () => void;
    errors: FieldErrors<PollFormValues>;
}

function QuestionEditor({
    qIndex,
    control,
    register,
    removeQuestion,
    errors,
}: QuestionEditorProps) {
    const {
        fields: options,
        append: appendOption,
        remove: removeOption,
    } = useFieldArray({
        name: `questions.${qIndex}.options` as const,
        control,
    });

    return (
        <Card className="border-l-4 border-l-primary relative">
            <div className="absolute top-4 right-4">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeQuestion}
                    className="text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
            <CardContent className="pt-6 space-y-4">
                <div className="pr-12">
                    <label className="block text-sm font-medium mb-1">
                        Question {qIndex + 1}
                    </label>
                    <Input
                        placeholder="What would you like to ask?"
                        {...register(`questions.${qIndex}.text` as const)}
                        error={errors?.questions?.[qIndex]?.text?.message}
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id={`req-${qIndex}`}
                        {...register(`questions.${qIndex}.isRequired` as const)}
                        className="rounded border-input text-primary focus:ring-primary"
                    />
                    <label htmlFor={`req-${qIndex}`} className="text-sm">
                        Required question
                    </label>
                </div>

                <div className="space-y-3 pt-2">
                    <label className="block text-sm font-medium text-muted-foreground">
                        Options
                    </label>
                    {options.map((option, oIndex) => (
                        <div key={option.id} className="flex items-start gap-2">
                            <div className="flex-1">
                                <Input
                                    placeholder={`Option ${oIndex + 1}`}
                                    {...register(
                                        `questions.${qIndex}.options.${oIndex}.value` as const,
                                    )}
                                    error={
                                        errors?.questions?.[qIndex]?.options?.[
                                            oIndex
                                        ]?.value?.message
                                    }
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(oIndex)}
                                disabled={options.length <= 2}
                                className="mt-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    {errors?.questions?.[qIndex]?.options?.message && (
                        <p className="text-sm text-destructive">
                            {errors.questions[qIndex]?.options?.message}
                        </p>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => appendOption({ value: "" })}
                        className="text-sm text-primary hover:text-primary/80"
                    >
                        <Plus className="w-3 h-3 mr-1" /> Add Option
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
