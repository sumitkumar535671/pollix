import {Router} from "express";
import validate from "../../shared/middlewares/validate.js";
import { postResponseSchema } from "./schemas.js";
import { handlePostResponse } from "./controller.js";

const router = Router({mergeParams:true});

router.post("/",validate(postResponseSchema),handlePostResponse);

export default router;
