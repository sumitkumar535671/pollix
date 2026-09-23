import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError.js";
import User from "../../modules/auth/model.js";

export default async function requireAuth(
    req:Request,
    res:Response,
    next:NextFunction,
) {
    const {userId} = getAuth(req);
    if(!userId){
        throw ApiError.unauthorized();
    }

    const user = await User.findOne({
        clerkUserId:userId
    });

    if(!user) throw ApiError.unauthorized();

    req.user = user;
    return next();
}