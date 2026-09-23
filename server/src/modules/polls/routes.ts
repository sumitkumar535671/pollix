import requireAuth  from "../../shared/middlewares/requireAuth.js";
import {Router} from "express";
import { handleCreatePoll, handleGetAllPolls, handleGetPoll, handlePublishPoll } from "./controller.js";
import validate from "../../shared/middlewares/validate.js";
import { createPollSchema, pollIdParamSchema } from "./schemas.js";

const router = Router();

router
    .route("/")
    .get(requireAuth ,handleGetAllPolls)
    .post(requireAuth,validate(createPollSchema),handleCreatePoll);

router.get("/:pollId",validate(pollIdParamSchema),handleGetPoll)

router.patch("/:pollId/publish",requireAuth,validate(pollIdParamSchema),handlePublishPoll)

// router.use("/:pollId/responses", responseRoutes);
// router.use("/:pollId/analytics", analyticsRoutes);

export default router
