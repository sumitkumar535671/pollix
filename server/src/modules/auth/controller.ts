import User from "./model.js";
import {getAuth} from "@clerk/express"

import ApiError from "../../shared/utils/ApiError.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";

import type{Request, Response, NextFunction} from "express";

export async function handleGetMe(req:Request,res:Response,next:NextFunction) {
    const {userId} = getAuth(req);

    if(!userId) throw ApiError.unauthorized();

    let user = await User.findOne({
        clerkUserId:userId
    });

    if(!user) {
        user = await User.create({
            clerkUserId:userId,
        });
    }

    return ApiResponse.success(res,"User fetched successfully",{
        user,
    });
}
