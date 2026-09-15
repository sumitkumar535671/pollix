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
