import { type Request, type Response as ExResponse, type NextFunction, text } from "express";
import Poll from "./model.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";
import type { CreatePollSchemaType, PollIdParamSchemaType } from "./schemas.js";
import ApiError from "../../shared/utils/ApiError.js";
import { getAuth } from "@clerk/express";
import User from "../auth/model.js";
import Question from "../questions/model.js";
import Response from "../responses/model.js";
import { emitPollPublished } from "../../shared/socket/emitter.js";
import { inngest } from "../../inngest/client.js";

export async function handleGetAllPolls(
    req:Request,
    res:ExResponse,
    next:NextFunction,
) {
    const polls = await Poll.find({creator:req.user!._id})
        .sort({
            createdAt:-1,
        })
        .lean();
    
    return ApiResponse.success(res, "Polls fetched successfully",{
        polls,
    });
}

export async function handleGetPoll(
    req:Request,
    res:ExResponse,
    next:NextFunction,
) {
    const {pollId} = (req.validated as PollIdParamSchemaType).params;

    const poll = await Poll.findById(pollId).lean();

    if(!poll){
        throw ApiError.notFound("Poll not found");
    }

    const {userId} = getAuth(req);
    let isOwner = false;
    let isAuthenticated = false;
    let requestingUser = null;

    if(userId){
        requestingUser = await User.findOne({clerkUserId:userId}).lean();

        if(requestingUser){
            isAuthenticated=true;
            if(requestingUser._id.toString()===poll.creator.toString()){
                isOwner=true;
            }
        }
    }

    const isPublished = Boolean(poll.publishedAt);
    const isExpired = poll.expiresAt < new Date();
    const allowsAnonymous = poll.responseAccess==="anonymous";
    const allowsAuthenticated = poll.responseAccess === "authenticated";

    // Access policy:--
    /*
        owner may view
        others may view if published 
        or if poll allows anonymous responses
        or if poll requires authenticated responses and requester is authenticated 
    */

    if(!isOwner && !isPublished && !allowsAnonymous && !(allowsAuthenticated && isAuthenticated)){
        throw ApiError.forbidden("Poll is not public");
    }

    const questions = await Question.find({poll:pollId}).sort({order:1}).lean();

    return ApiResponse.success(res,"poll fetched successfully",{
        poll,
        questions,
        meta:{
            isOwner,
            canRespond:!isExpired && !isPublished
        }
    })

}

export async function handleCreatePoll(
    req:Request,
    res:ExResponse,
    next:NextFunction,
) {
    const {title,description,responseAccess,expiresAt,questions} = (req.validated as CreatePollSchemaType).body;

    const createdPoll = new Poll({
        creator:req.user!._id,
        title,
        description,
        responseAccess,
        expiresAt,
    });

    await createdPoll.save();
     
    await inngest.send({
        name: "poll/created",
        data: {
            title:title,
        },
    });

    const createdQuestions = await Question.insertMany(
        questions.map((question,index)=>({
            poll:createdPoll._id,
            text:question.text,
            isRequired:question.isRequired,
            order:index,
            options:question.options.map((option)=>({text:option})),
        }))
    )

    return ApiResponse.success(res, "poll created successFully",{
        poll:createdPoll,
        questions:createdQuestions,
    });
}

export async function handlePublishPoll(
    req:Request,
    res:ExResponse,
    next:NextFunction,
) {
    const {pollId} = (req.validated as PollIdParamSchemaType).params;

    const poll = await Poll.findById(pollId);

    if(!poll){
        throw ApiError.notFound("Poll not found");
    }

    if(!poll.creator.equals(req.user!._id)){
        throw ApiError.forbidden("You are not allowed to publish this poll")
    }

    if(poll.publishedAt){
        throw ApiError.badRequest("Poll has already been published");
    }

    poll.publishedAt = new Date();
    await poll.save();

    emitPollPublished(poll._id.toString(),poll.publishedAt);

    await inngest.send({
        name: "poll/published",
        data: {
            pollId: poll._id.toString(),
            title: poll.title,
            publishedAt: poll.publishedAt,
        },
    });

    return ApiResponse.success(res, "poll published successfully",{
        poll,
    });
}

export async function handleDeletePoll(
    req: Request,
    res: ExResponse,
    next: NextFunction,
) {
    const { pollId } = (req.validated as PollIdParamSchemaType).params;

    const poll = await Poll.findById(pollId);

    if (!poll) {
        throw ApiError.notFound("Poll not found");
    }

    if (!poll.creator.equals(req.user!._id)) {
        throw ApiError.forbidden("You are not allowed to delete this poll");
    }

    await Promise.all([
        Question.deleteMany({ poll: poll._id }),
        Response.deleteMany({ poll: poll._id }),
    ]);
    await poll.deleteOne();
    
    await inngest.send({
        name: "poll/deleted",
        data: {
            title: poll.title,
        },
    });

    return ApiResponse.success(res, "Poll deleted successfully", null);
}
