import { api } from "../../shared/lib/api";
import type {
    ApiResponse,
    Poll,
    CreatePollPayload,
    PollResponsePayload,
    PollDetails,
    CreatePollResult,
    SubmitPollResponseResult,
} from "./types";

export async function getPolls() {
    const { data } =
        await api.get<ApiResponse<{ polls: Poll[] }>>("/api/polls");
    return data.data.polls;
}

export async function createPoll(payload: CreatePollPayload) {
    const { data } = await api.post<ApiResponse<CreatePollResult>>(
        "/api/polls",
        payload,
    );
    return data.data.poll;
}

export async function getPollById(pollId: string) {
    const { data } = await api.get<ApiResponse<PollDetails>>(
        `/api/polls/${pollId}`,
    );
    return data.data;
}

export async function publishPoll(pollId: string) {
    const { data } = await api.patch<ApiResponse<{ poll: Poll }>>(
        `/api/polls/${pollId}/publish`,
    );
    return data.data.poll;
}

export async function submitPollResponse(
    pollId: string,
    payload: PollResponsePayload,
) {
    const { data } = await api.post<ApiResponse<SubmitPollResponseResult>>(
        `/api/polls/${pollId}/responses`,
        payload,
    );
    return data.data;
}
