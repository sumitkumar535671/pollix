import {Schema, model, type InferSchemaType} from "mongoose";

const userSchema = new Schema({
    clerkUserId:{
        type:String,
        required:true,
        unique:true,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    }
},
    {
        timestamps:true,
    }
);

const User = model("User",userSchema);

export type User = InferSchemaType<typeof userSchema>;
export default User;
