import {inngest} from "./client.js";
import "dotenv/config";

export const heathFunction = inngest.createFunction(
    {
        id:"on-heath-check",
        retries:2,
        triggers:[{event:"health/check"}]
    },
    async ({event,step,attempt})=>{
        await step.run("health", async()=>{
            console.log("inngest is working")
        });
        return {ok : true};
    }
)

export const pollCreatedFunction = inngest.createFunction(
    {
        id: "on-poll-creation",
        retries: 3,
        triggers: [{ event: "poll/created" }],
    },
    async ({ event, step }) => {
        const poll = event.data;

        await step.run("notify-poll-created", async () => {
            console.log(`Poll created: ${poll.title}`);
        });

        return { pollCreated: true };
    },
);

export const pollPublishedFunction = inngest.createFunction(
    {
        id: "on-poll-published",
        retries: 3,
        triggers: [{ event: "poll/published" }],
    },
    async ({ event, step }) => {
        const poll = event.data;

        await step.run("notify-poll-published", async () => {
            console.log(`Poll published: ${poll.title}`);
        });

        return { pollPublished: true };
    },
);

export const pollResponseSubmittedFunction = inngest.createFunction(
    {
        id: "on-poll-response-submitted",
        retries: 3,
        triggers: [{ event: "poll/response-submitted" }],
    },
    async ({ event, step }) => {
        const response = event.data;

        await step.run("notify-poll-response-submitted", async () => {
            console.log(`Poll response submitted: ${response.pollId}`);
        });

        return { pollResponseSubmitted: true };
    },
);

export const pollAnalyticsUpdatedFunction = inngest.createFunction(
    {
        id: "on-poll-analytics-updated",
        retries: 3,
        triggers: [{ event: "poll/analytics-updated" }],
    },
    async ({ event, step }) => {
        const analytics = event.data;

        await step.run("notify-poll-analytics-updated", async () => {
            console.log(`Poll analytics updated: ${analytics.pollId}`);
        });

        return { pollAnalyticsUpdated: true };
    },
);

export const pollDeletedFunction = inngest.createFunction(
    {
        id: "on-poll-deleted",
        retries: 3,
        triggers: [{ event: "poll/deleted" }],
    },
    async ({ event, step }) => {
        const poll = event.data;

        await step.run("notify-poll-deleted", async () => {
            console.log(`Poll deleted: ${poll.title}`);
        });

        return { pollDeleted: true };
    },
);
