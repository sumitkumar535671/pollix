import {connect} from "mongoose";

import env from "./env.js";

export async function connectDb() {
    await connect(env.MONGODB_URL);
    console.log("Connected to mongoDb");
}
