import { Link } from "react-router";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "../../../shared/components/Button";

export default function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <FileQuestion className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
                Page Not Found
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
                We couldn't find the page you're looking for. It might have been
                moved or deleted.
            </p>
            <Link to="/">
                <Button size="lg">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Button>
            </Link>
        </div>
    );
}
