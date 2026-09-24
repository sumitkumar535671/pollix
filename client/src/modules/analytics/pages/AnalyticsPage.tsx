import { useParams, useNavigate } from "react-router";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import { Button } from "../../../shared/components/Button";
import { ArrowLeft } from "lucide-react";

export default function AnalyticsPage() {
    const { pollId } = useParams<{ pollId: string }>();
    const navigate = useNavigate();

    if (!pollId) return null;

    return (
        <div className="pt-4">
            <div className="container mx-auto px-4 max-w-5xl mb-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    className="mb-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>
            <AnalyticsDashboard pollId={pollId} />
        </div>
    );
}
