import type { NextFunction, Request, Response } from "express";
import type {z} from "zod";
import ApiError from "../utils/ApiError.js";

type ValidationSchema = z.ZodObject<{
    body?:z.ZodType;
    query?:z.ZodType;
    params?:z.ZodType;
}>

export default function validate(schema:ValidationSchema){
    return (req:Request, res:Response, next:NextFunction)=>{
        const result = schema.safeParse({
            body:req.body,
            query:req.query,
            params:req.params,
        });

        if(!result.success){
            const message = result.error.issues
                .map((issue) => issue.message)
                .join(", ");

            throw ApiError.badRequest(message);
        }

        req.validated = result.data;
        return next();
    }
}
