import Response from "./model.js";
import type { NextFunction, Request, Response as ResExpress } from "express";
import type { PostResponseSchemaType } from "./schemas.js";
import Poll from "../polls/model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { validatePollAnswers } from "./service.js";
import { getAuth } from "@clerk/express";
import User from "../auth/model.js";
import { generateAnonymousToken, hashAnonymousToken } from "./utils.js";
import env from "../../shared/config/env.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";
import { computeAnalytics } from "../analytics/service.js";
import { emitAnalyticsUpdate } from "../../shared/socket/emitter.js";
import { inngest } from "../../inngest/client.js";


export async function handlePostResponse(
    req:Request,
    res:ResExpress,
    next:NextFunction,
) {
    const {pollId} = (req.validated as PostResponseSchemaType).params;
    const {answers} = (req.validated as PostResponseSchemaType).body;

    const poll = await Poll.findById(pollId);
    if(!poll){
        throw ApiError.notFound("Poll not found");
    }

    if(poll.publishedAt){
        throw ApiError.badRequest("This poll has already been published");
    }

    if (poll.expiresAt < new Date()) {
        throw ApiError.badRequest("This poll has expired");
    }

    await validatePollAnswers(pollId, answers);

    const {userId} = getAuth(req);

    let user = null;

    if(userId){
        user = await User.findOne({clerkUserId:userId})
    }

    if (poll.responseAccess === "authenticated" && !user) {
        throw ApiError.unauthorized(
            "You must be signed in to participate in this poll",
        );
    }

    let anonymousTokenHash: string | null = null;

    // handle anonymous duplicate prevention using cookies
    if(poll.responseAccess === "anonymous"){
        const cookieName = `poll_${pollId}_token`;

        let anonymousToken = req.cookies?.[cookieName];

        if(!anonymousToken){
            anonymousToken = generateAnonymousToken();

            res.cookie(cookieName,anonymousToken,{
                httpOnly:true,
                sameSite:"lax",
                secure:env.NODE_ENV === "production",
                maxAge:30*24*60*60*1000, //30 days
            })
        }
        anonymousTokenHash = hashAnonymousToken(anonymousToken);
    }

    const duplicateConditions = [];

    if(user){
        duplicateConditions.push({
            respondent:user._id,
        })
    }

    if(anonymousTokenHash){
        duplicateConditions.push({
            anonymousTokenHash,
        })
    }

    if (duplicateConditions.length === 0) {
        throw ApiError.unauthorized(
            "You must be signed in to participate in this poll",
        );
    }

    // check if user has already responded
    const existingResponse = await Response.findOne({
        poll:poll._id,
        $or:duplicateConditions,
    });

    if(existingResponse){
        //attach logged-in user to previous anonymous response
        if(user && !existingResponse.respondent){
            existingResponse.respondent = user._id;
            await existingResponse.save()
        }
        throw ApiError.badRequest("You have already responded to this poll");
    }

    const createResponse = await Response.create({
        poll:poll._id,
        respondent:user?._id ?? null,
        anonymousTokenHash,
        answers,
    });

    ApiResponse.success(res,"Response recorded successfully",{
        response:createResponse,
    });
    
    await inngest.send({
        name: "poll/response-submitted",
        data: {
            pollId: poll._id,
            userId: user?._id ?? null,
            anonymousTokenHash,
            answers,
        }
    });

    const analytics = await computeAnalytics(poll._id);

    emitAnalyticsUpdate(poll._id.toString(), {
        poll,
        ...analytics,
        insights: {
            status: poll.publishedAt
                ? "published"
                : poll.expiresAt < new Date()
                  ? "expired"
                  : "active",

            ...analytics.insights,
        },
    });
    await inngest.send({
        name: "poll/analytics-updated",
        data: {
            pollId: poll._id,
            ...analytics,
        }
    });

    return;
}
