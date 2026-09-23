import {Schema, model, type InferSchemaType} from "mongoose";

const pollSchema = new Schema({
    creator:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    title:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        trim:true,
        default:"",
    },
    responseAccess:{
        type:String,
        enum:["anonymous","authenticated"],
        default:"anonymous",
    },
    expiresAt:{
        type:Date,
        required:true,
    },
    publishedAt:{
        type:Date,
        default:null
    },

},{timestamps:true});

pollSchema.index({creator:1, createdAt:-1});
pollSchema.index({expiresAt:1});

const Poll = model("Poll",pollSchema);

export type Poll = InferSchemaType<typeof pollSchema>;
export default Poll;
