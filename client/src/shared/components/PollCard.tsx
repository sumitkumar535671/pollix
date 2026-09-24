import { Link } from "react-router";
import { Copy, BarChart2, Eye, Send } from "lucide-react";
import { toast } from "sonner";
import type { Poll } from "../../modules/polls/types";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "./Card";
import { Button } from "./Button";

interface PollCardProps {
    poll: Poll;
    onPublish?: (pollId: string) => Promise<void>;
    isPublishing?: boolean;
}

export function PollCard({
    poll,
    onPublish,
    isPublishing = false,
}: PollCardProps) {
    const isPublished = !!poll.publishedAt;
    const isExpired = !isPublished && new Date(poll.expiresAt) < new Date();
    const statusLabel = isPublished
        ? "Published"
        : isExpired
          ? "Expired"
          : "Active";
    const statusClassName = isPublished
        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        : isExpired
          ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    const publicUrl = `${window.location.origin}/polls/${poll._id}`;

    const copyLink = () => {
        navigator.clipboard.writeText(publicUrl);
        toast.success("Link copied to clipboard");
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl line-clamp-1">
                        {poll.title}
                    </CardTitle>
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusClassName}`}
                    >
                        {statusLabel}
                    </span>
                </div>
                {poll.description && (
                    <CardDescription className="line-clamp-2">
                        {poll.description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="flex-1">
                <div className="text-sm text-muted-foreground mb-4">
                    <p>Access: {poll.responseAccess}</p>
                    <p>
                        Expires: {new Date(poll.expiresAt).toLocaleDateString()}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-2 border-t pt-4">
                <div className="flex gap-2">
                    <Link to={`/polls/${poll._id}`}>
                        <Button
                            variant="outline"
                            size="sm"
                            title="View Public Page"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyLink}
                        title="Copy Link"
                    >
                        <Copy className="w-4 h-4" />
                    </Button>
                    {!isPublished && onPublish && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPublish(poll._id)}
                            title="Publish Poll"
                            disabled={isPublishing}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    )}
                </div>
                <Link to={`/polls/${poll._id}/analytics`} className="w-full">
                    <Button variant="secondary" size="sm" className="w-full">
                        <BarChart2 className="w-4 h-4 mr-2" />
                        Analytics
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
