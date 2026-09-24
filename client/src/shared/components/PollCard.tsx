import { Link } from "react-router";
import { useState } from "react";
import {
    AlertTriangle,
    BarChart2,
    Copy,
    Eye,
    Send,
    Trash2,
    X,
} from "lucide-react";
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
    onDelete?: (pollId: string) => Promise<void>;
    isDeleting?: boolean;
}

export function PollCard({
    poll,
    onPublish,
    isPublishing = false,
    onDelete,
    isDeleting = false,
}: PollCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

    const handleDelete = () => {
        if (!onDelete || isDeleting) return;
        void onDelete(poll._id);
    };

    return (
        <>
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
                    {onDelete && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            title="Delete Poll"
                            aria-label={`Delete ${poll.title}`}
                            disabled={isDeleting}
                        >
                            <Trash2 className="w-4 h-4" />
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

            {isDeleteDialogOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setIsDeleteDialogOpen(false);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-md rounded-3xl border border-foreground/10 bg-card p-6 text-card-foreground shadow-2xl sm:p-8"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby={`delete-poll-title-${poll._id}`}
                        aria-describedby={`delete-poll-description-${poll._id}`}
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                aria-label="Close delete confirmation"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <h2
                            id={`delete-poll-title-${poll._id}`}
                            className="text-2xl font-bold tracking-tight"
                        >
                            Delete this poll?
                        </h2>
                        <p
                            id={`delete-poll-description-${poll._id}`}
                            className="mt-3 leading-7 text-muted-foreground"
                        >
                            <span className="font-semibold text-foreground">{poll.title}</span>{" "}
                            and all of its questions and responses will be permanently removed.
                        </p>
                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                disabled={isDeleting}
                            >
                                Keep poll
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {isDeleting ? "Deleting..." : "Delete poll"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
