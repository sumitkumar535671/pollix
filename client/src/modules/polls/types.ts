export interface User {
    _id: string;
    clerkUserId: string;
}

export interface Poll {
    _id: string;
    title: string;
    description?: string;
    creator: string;
    responseAccess: "anonymous" | "authenticated";
    expiresAt: string;
    publishedAt: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface Option {
    _id: string;
    text: string;
}

export interface Question {
    _id: string;
    poll: string;
    text: string;
    isRequired: boolean;
    order: number;
    options: Option[];
}

export interface PollMeta {
    isOwner: boolean;
    canRespond: boolean;
}

export interface PollDetails {
    poll: Poll;
    questions: Question[];
    meta: PollMeta;
}

export interface PollResponse {
    _id: string;
    poll: string;
    respondent: string | null;
    anonymousTokenHash: string | null;
    answers: {
        question: string;
        selectedOption: string;
    }[];
    createdAt: string;
}

export interface CreatePollPayload {
    title: string;
    description?: string;
    responseAccess: "anonymous" | "authenticated";
    expiresAt: string;
    questions: {
        text: string;
        options: string[];
        isRequired: boolean;
    }[];
}

export interface PollResponsePayload {
    answers: {
        question: string;
        selectedOption: string;
    }[];
}

export interface CreatePollResult {
    poll: Poll;
    questions: Question[];
}

export interface SubmitPollResponseResult {
    response: PollResponse;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
