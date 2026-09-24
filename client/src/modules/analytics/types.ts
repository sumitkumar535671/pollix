import type { Poll } from "../polls/types";

export interface AnalyticsOption {
    optionId: string;
    optionText: string;
    count: number;
    percentage: number;
}

export interface AnalyticsQuestion {
    questionId: string;
    questionText: string;
    totalAnswers: number;
    options: AnalyticsOption[];
}

export interface AnalyticsInsights {
    status: "published" | "unpublished" | "active" | "expired";
    totalQuestions: number;
    participation: {
        authenticated: { count: number; percentage: number };
        anonymous: { count: number; percentage: number };
    };
}

export interface AnalyticsData {
    poll: Partial<Poll>;
    totalResponses: number;
    questions: AnalyticsQuestion[];
    insights: AnalyticsInsights;
}
