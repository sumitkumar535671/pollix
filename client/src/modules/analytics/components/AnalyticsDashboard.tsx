import { useEffect, useState, useCallback } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { getAnalytics } from "../api";
import { publishPoll } from "../../polls/api";
import { getPollById } from "../../polls/api";
import type { AnalyticsData } from "../types";
import type { Poll, Question } from "../../polls/types";
import { useSocket } from "../../../shared/hooks/useSocket";
import { getApiErrorMessage } from "../../../shared/lib/api";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "../../../shared/components/Card";
import { Button } from "../../../shared/components/Button";
import { toast } from "sonner";
import { Users, Globe, Activity, CheckCircle2 } from "lucide-react";

export default function AnalyticsDashboard({
    pollId,
    isPublicView = false,
    initialPoll,
}: {
    pollId: string;
    isPublicView?: boolean;
    initialPoll?: Partial<Poll>;
}) {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [pollQuestions, setPollQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const socket = useSocket({ pollId });

    const fetchAnalytics = useCallback(async () => {
        try {
            const res = await getAnalytics(pollId);
            setData(res);
        } catch (err) {
            console.error("Failed to fetch analytics", err);
            toast.error(getApiErrorMessage(err, "Failed to load analytics"));
        } finally {
            setIsLoading(false);
        }
    }, [pollId]);

    const fetchPollDetails = useCallback(async () => {
        try {
            const res = await getPollById(pollId);
            setPollQuestions(res.questions);
        } catch (err) {
            console.error("Failed to fetch poll details", err);
        }
    }, [pollId]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchAnalytics();
            void fetchPollDetails();
        }, 0);

        return () => {
            window.clearTimeout(timer);
        };
    }, [fetchAnalytics, fetchPollDetails]);

    useEffect(() => {
        if (!socket) return;

        const handleUpdate = (snapshot: AnalyticsData) => {
            setData(snapshot);
        };

        socket.on("poll:analytics:update", handleUpdate);

        return () => {
            socket.off("poll:analytics:update", handleUpdate);
        };
    }, [socket]);

    const handlePublish = async () => {
        try {
            setIsPublishing(true);
            const updatedPoll = await publishPoll(pollId);
            setData((prev) =>
                prev
                    ? {
                          ...prev,
                          poll: {
                              ...prev.poll,
                              publishedAt: updatedPoll.publishedAt,
                          },
                      }
                    : null,
            );
            toast.success("Poll published successfully!");
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Failed to publish poll"));
        } finally {
            setIsPublishing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 text-center text-muted-foreground animate-pulse">
                Loading analytics...
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8 text-center text-destructive">
                Could not load data.
            </div>
        );
    }

    const { poll, totalResponses, questions, insights } = data;
    const isPublished = !!poll.publishedAt;
    const isAuthenticatedPoll = poll.responseAccess === "authenticated";

    // Provide defaults if insights is missing initially
    const participation = insights?.participation || {
        authenticated: { count: 0, percentage: 0 },
        anonymous: { count: 0, percentage: 0 },
    };

    const COLORS = [
        "#10b981",
        "#14b8a6",
        "#22c55e",
        "#84cc16",
        "#0ea5e9",
        "#06b6d4",
        "#3b82f6",
        "#6366f1",
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        {isPublicView ? "Results:" : "Analytics:"}{" "}
                        {poll.title || initialPoll?.title}
                    </h1>
                    <div className="flex items-center gap-3">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPublished ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`}
                        >
                            {isPublished ? (
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                            ) : (
                                <Activity className="w-3 h-3 mr-1" />
                            )}
                            {isPublished ? "Published" : "Collecting Responses"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {totalResponses} total response
                            {totalResponses !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {!isPublicView && !isPublished && (
                    <Button onClick={handlePublish} disabled={isPublishing}>
                        {isPublishing ? "Publishing..." : "Publish Results"}
                    </Button>
                )}
            </div>

            {!isPublicView && (
                <div
                    className={`grid grid-cols-1 gap-6 mb-8 ${isAuthenticatedPoll ? "md:grid-cols-2" : "md:grid-cols-3"}`}
                >
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        Total Responses
                                    </p>
                                    <p className="text-3xl font-bold">
                                        {totalResponses}
                                    </p>
                                </div>
                                <div className="p-3 bg-primary/10 rounded-full text-primary">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        Questions
                                    </p>
                                    <p className="text-3xl font-bold">
                                        {insights?.totalQuestions ||
                                            questions.length}
                                    </p>
                                </div>
                                <div className="p-3 bg-accent rounded-full text-accent-foreground">
                                    <Activity className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {!isAuthenticatedPoll && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                            Anonymous Ratio
                                        </p>
                                        <p className="text-3xl font-bold">
                                            {participation.anonymous.percentage}
                                            %
                                        </p>
                                    </div>
                                    <div className="p-3 bg-secondary rounded-full text-secondary-foreground">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            <div className="space-y-8">
                {questions.map((q, index) => (
                    <Card key={q.questionId} className="overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="text-xl font-semibold leading-tight flex items-start gap-2">
                                <span className="text-muted-foreground">
                                    {index + 1}.
                                </span>
                                <span>{q.questionText}</span>
                                {(() => {
                                    const questionMeta = pollQuestions.find(
                                        (question) =>
                                            question._id === q.questionId,
                                    );

                                    if (!questionMeta) {
                                        return null;
                                    }

                                    return questionMeta.isRequired ? (
                                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-destructive">
                                            Required *
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Optional
                                        </span>
                                    );
                                })()}
                            </CardTitle>
                            <CardDescription>
                                {q.totalAnswers} answer
                                {q.totalAnswers !== 1 ? "s" : ""}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={q.options}
                                            layout="vertical"
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="optionText"
                                                type="category"
                                                width={100}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: "transparent" }}
                                                contentStyle={{
                                                    borderRadius: "8px",
                                                    border: "1px solid hsl(var(--border))",
                                                    backgroundColor:
                                                        "hsl(var(--card))",
                                                    color: "hsl(var(--card-foreground))",
                                                }}
                                            />
                                            <Bar
                                                dataKey="count"
                                                radius={[0, 4, 4, 0]}
                                            >
                                                {q.options.map((_, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            COLORS[
                                                                index %
                                                                    COLORS.length
                                                            ]
                                                        }
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-4">
                                    {q.options.map((opt, i) => (
                                        <div
                                            key={opt.optionId}
                                            className="relative"
                                        >
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium">
                                                    {opt.optionText}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {opt.count} (
                                                    {opt.percentage}%)
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500 ease-in-out"
                                                    style={{
                                                        width: `${opt.percentage}%`,
                                                        backgroundColor:
                                                            COLORS[
                                                                i %
                                                                    COLORS.length
                                                            ],
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
