import { api } from "../../shared/lib/api";
import type { ApiResponse } from "../polls/types";
import type { AnalyticsData } from "./types";

export async function getAnalytics(pollId: string) {
    const { data } = await api.get<ApiResponse<AnalyticsData>>(
        `/api/polls/${pollId}/analytics`,
    );
    return data.data;
}
