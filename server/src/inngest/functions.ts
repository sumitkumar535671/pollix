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
