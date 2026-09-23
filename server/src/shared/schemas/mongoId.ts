import {z} from "zod";
import {Types} from "mongoose";

export const mongoIdSchema = z.string({
    error:"Invalid id",
}).refine((id)=>Types.ObjectId.isValid(id),{
    message:"Invalid MongoDb id",
});
