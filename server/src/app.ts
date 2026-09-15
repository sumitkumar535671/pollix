import express from "express";
import type { Request, Response } from "express";

import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import {heathFunction} from "./inngest/functions.js";
import 'dotenv/config';

export function createServerApplication() {
    console.log(process.env.INNGEST_DEV);
    const app = express();

    app.use(express.json());
    app.use("/api/inngest", serve({
        client:inngest,
        functions:[heathFunction]
    }));

    app.get("/health",async(req:Request,res:Response)=>{

        await inngest.send({
            name:"health/check",
            data:{}
        })
        res.status(200).json({message:true});
    })
    return app;
}

