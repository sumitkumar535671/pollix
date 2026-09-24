import type { NextFunction, Request,Response as ResExpress } from "express";
import type { PollIdParamSchemaType } from "./schemas.js";
import Poll from "../polls/model.js";
import { getAuth } from "@clerk/express";
import ApiError from "../../shared/utils/ApiError.js";
import User from "../auth/model.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";
import { computeAnalytics } from "./service.js";

export async function handleGetAnalytics(
    req: Request,
    res:ResExpress,
    next:NextFunction,
) {
    const {pollId} = (req.validated as PollIdParamSchemaType).params;

    const poll = await Poll.findById(pollId).lean();

    if (!poll) {
        throw ApiError.notFound("Poll not found");
    }

    const {userId} = getAuth(req);

    let isOwner = false;

    if(userId){
        const user = await User.findOne({
            clerkUserId:userId,
        });

        if(user){
            isOwner = poll.creator.toString() === user._id.toString();
        }
    }

     // unpublished results are only visible to owner
    if (!isOwner && !poll.publishedAt) {
        throw ApiError.forbidden("Results are not published yet");
    }

    const analytics = await computeAnalytics(poll._id);

    return ApiResponse.success(res,"Analytics fetched successfully",{
        poll,
        ...analytics,
        insights:{
            status:poll.publishedAt?"published":poll.expiresAt< new Date() ?"expired":"active",...analytics.insights,
        },
    })
}