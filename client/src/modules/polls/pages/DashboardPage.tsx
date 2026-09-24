import { useEffect, useState } from "react";
import { Link } from "react-router";
import { PlusCircle, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { getPolls, publishPoll } from "../api";
import type { Poll } from "../types";
import { PollCard } from "../../../shared/components/PollCard";
import { Button } from "../../../shared/components/Button";
import { getApiErrorMessage } from "../../../shared/lib/api";

export default function DashboardPage() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [publishingPollId, setPublishingPollId] = useState<string | null>(
        null,
    );

    useEffect(() => {
        async function loadPolls() {
            try {
                const data = await getPolls();
                setPolls(data || []);
            } catch (err) {
                setError(getApiErrorMessage(err, "Failed to load polls"));
            } finally {
                setIsLoading(false);
            }
        }
        loadPolls();
    }, []);

    const handlePublish = async (pollId: string) => {
        try {
            setPublishingPollId(pollId);
            const publishedPoll = await publishPoll(pollId);
            setPolls((previousPolls) =>
                previousPolls.map((poll) =>
                    poll._id === pollId
                        ? {
                              ...poll,
                              publishedAt: publishedPoll.publishedAt,
                          }
                        : poll,
                ),
            );
            toast.success("Poll published successfully");
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Failed to publish poll"));
        } finally {
            setPublishingPollId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-48 rounded-xl border bg-muted animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-destructive">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                </div>
                <Link to="/polls/new">
                    <Button className="w-full sm:w-auto">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create Poll
                    </Button>
                </Link>
            </div>

            {polls.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card border-dashed">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <PlusCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No polls yet</h2>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        You haven't created any polls. Create your first poll to
                        start gathering responses.
                    </p>
                    <Link to="/polls/new">
                        <Button>Create Your First Poll</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {polls.map((poll) => (
                        <PollCard
                            key={poll._id}
                            poll={poll}
                            onPublish={handlePublish}
                            isPublishing={publishingPollId === poll._id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
