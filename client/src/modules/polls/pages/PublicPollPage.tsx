import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { SignInButton, useAuth } from "@clerk/react";
import { toast } from "sonner";
import axios from "axios";
import { getPollById, submitPollResponse } from "../api";
import type { PollDetails, Question } from "../types";
import { useSocket } from "../../../shared/hooks/useSocket";
import { getApiErrorMessage } from "../../../shared/lib/api";
import { Button } from "../../../shared/components/Button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "../../../shared/components/Card";
import AnalyticsDashboard from "../../analytics/components/AnalyticsDashboard";

export default function PublicPollPage() {
    const { pollId } = useParams<{ pollId: string }>();
    const navigate = useNavigate();
    const { isSignedIn, isLoaded: authLoaded } = useAuth();

    const [pollData, setPollData] = useState<PollDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [requiresSignIn, setRequiresSignIn] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const socket = useSocket({
        pollId,
        enabled: Boolean(pollData),
    });

    const {
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<Record<string, string>>();

    useEffect(() => {
        async function loadPoll() {
            if (!pollId) return;
            try {
                const data = await getPollById(pollId);
                setPollData(data);
            } catch (err) {
                if (
                    axios.isAxiosError(err) &&
                    err.response?.status === 403 &&
                    err.response?.data?.message === "Poll is not public"
                ) {
                    setRequiresSignIn(true);
                    setError(null);
                    return;
                }

                setError(getApiErrorMessage(err, "Failed to load poll"));
            } finally {
                setIsLoading(false);
            }
        }

        // We should only load the poll once auth state is determined
        if (authLoaded) {
            loadPoll();
        }
    }, [pollId, authLoaded]);

    useEffect(() => {
        if (!socket) return;

        const handlePublish = (payload: {
            pollId: string;
            publishedAt: string;
        }) => {
            if (payload.pollId === pollId) {
                setPollData((prev) => {
                    if (!prev) {
                        return prev;
                    }

                    return {
                        ...prev,
                        poll: {
                            ...prev.poll,
                            publishedAt: payload.publishedAt,
                        },
                    };
                });
                toast.info(
                    "This poll has just been published! Showing live results.",
                );
            }
        };

        socket.on("poll:publish", handlePublish);

        return () => {
            socket.off("poll:publish", handlePublish);
        };
    }, [socket, pollId]);

    if (!authLoaded || isLoading) {
        return (
            <div className="p-8 text-center text-muted-foreground animate-pulse">
                Loading poll...
            </div>
        );
    }

    if (requiresSignIn) {
        return (
            <div className="container mx-auto px-4 py-16 text-center max-w-lg">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    You should be logged in to answer this poll
                </h2>
                <p className="text-muted-foreground mb-6">
                    Please sign in to access this authenticated poll.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <SignInButton mode="modal">
                        <Button>Sign In</Button>
                    </SignInButton>
                    <Button variant="outline" onClick={() => navigate("/")}>
                        Return Home
                    </Button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center max-w-lg">
                <h2 className="text-2xl font-bold text-destructive mb-2">
                    Oops!
                </h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={() => navigate("/")}>Return Home</Button>
            </div>
        );
    }

    if (!pollData) return null;

    const { poll, questions, meta } = pollData;
    const isPublished = !!poll.publishedAt;
    const isExpired = new Date(poll.expiresAt) < new Date();
    const requiresAuth = poll.responseAccess === "authenticated" && !isSignedIn;

    if (requiresAuth) {
        return (
            <div className="container mx-auto px-4 py-16 text-center max-w-lg">
                <Card>
                    <CardHeader>
                        <CardTitle>Sign in Required</CardTitle>
                        <CardDescription>
                            The creator of this poll requires respondents to be
                            signed in.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Please use the sign in button in the header to
                            authenticate and view this poll.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isPublished) {
        return (
            <AnalyticsDashboard
                pollId={pollId!}
                isPublicView={true}
                initialPoll={poll}
            />
        );
    }

    if (isExpired) {
        return (
            <div className="container mx-auto px-4 py-16 text-center max-w-lg">
                <Card>
                    <CardHeader>
                        <CardTitle>This poll has expired</CardTitle>
                        <CardDescription>
                            The response window has closed, so new answers can
                            no longer be submitted.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            If the creator publishes the results, they will
                            appear here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isSubmitted || !meta.canRespond) {
        return (
            <div className="container mx-auto px-4 py-16 text-center max-w-lg">
                <Card className="border-green-500/20 bg-green-500/5">
                    <CardHeader>
                        <CardTitle className="text-green-600 dark:text-green-400">
                            Response Recorded
                        </CardTitle>
                        <CardDescription>
                            Thank you for participating! Your response has been
                            saved.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            If the creator publishes the results, they will
                            appear here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const onSubmit = async (data: Record<string, string>) => {
        try {
            const answers = Object.entries(data)
                .filter(([, selectedOption]) => Boolean(selectedOption))
                .map(([questionId, selectedOption]) => ({
                    question: questionId,
                    selectedOption,
                }));

            if (answers.length === 0) {
                toast.error("Please answer at least one question.");
                return;
            }

            await submitPollResponse(pollId!, { answers });
            setIsSubmitted(true);
            toast.success("Response submitted successfully!");
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Failed to submit response"));
        }
    };

    const getQuestionError = (question: Question) => {
        const questionError = errors[question._id];
        if (!questionError) {
            return null;
        }

        return String(questionError.message || "This question is required");
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    {poll.title}
                </h1>
                {poll.description && (
                    <p className="text-muted-foreground text-lg">
                        {poll.description}
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {questions.map((q: Question, index: number) => (
                    <Card
                        key={q._id}
                        className={
                            getQuestionError(q)
                                ? "border-destructive ring-1 ring-destructive"
                                : ""
                        }
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-start gap-2">
                                <span>{index + 1}.</span>
                                <span>{q.text}</span>
                                {q.isRequired && (
                                    <span className="text-destructive ml-1 text-sm">
                                        *
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Controller
                                name={q._id}
                                control={control}
                                rules={{
                                    required: q.isRequired
                                        ? "This question is required"
                                        : false,
                                }}
                                render={({ field }) => (
                                    <div className="space-y-3">
                                        {q.options.map((opt) => (
                                            <label
                                                key={opt._id}
                                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${field.value === opt._id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"}`}
                                            >
                                                <input
                                                    type="radio"
                                                    className="w-4 h-4 text-primary border-muted focus:ring-primary mr-3"
                                                    {...field}
                                                    value={opt._id}
                                                    checked={
                                                        field.value === opt._id
                                                    }
                                                />
                                                <span className="text-sm font-medium">
                                                    {opt.text}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            />
                            {getQuestionError(q) && (
                                <p className="text-sm text-destructive mt-2">
                                    {getQuestionError(q)}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}

                <div className="pt-4">
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Submit Response"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
