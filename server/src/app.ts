import express from "express";
import type { Request, Response } from "express";

import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import {heathFunction} from "./inngest/functions.js";
import 'dotenv/config';

import authRoutes from "./modules/auth/routes.js";
import pollRoutes from "./modules/polls/routes.js";

import {clerkMiddleware} from "@clerk/express";
import cookieParser from "cookie-parser";
import env from "./shared/config/env.js";
import cors from "cors";
import notFoundHandler from "./shared/middlewares/notFoundHandler.js";
import errorHandler from "./shared/middlewares/errorHandler.js";

export function createServerApplication() {
    console.log(process.env.INNGEST_DEV);
    const app = express();

    app.use(express.json());
    app.use(cookieParser());
    app.use(clerkMiddleware());

    app.use(
        cors({
            origin: env.CLIENT_URL,
            credentials: true,
        }),
    );

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
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/polls", pollRoutes);

    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}

