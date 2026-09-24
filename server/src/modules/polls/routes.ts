import requireAuth  from "../../shared/middlewares/requireAuth.js";
import {Router} from "express";
import { handleCreatePoll, handleDeletePoll, handleGetAllPolls, handleGetPoll, handlePublishPoll } from "./controller.js";
import validate from "../../shared/middlewares/validate.js";
import { createPollSchema, pollIdParamSchema } from "./schemas.js";

import responseRoutes from "../responses/routes.js";
import analyticsRoutes from "../analytics/routes.js";

const router = Router();

router
    .route("/")
    .get(requireAuth ,handleGetAllPolls)
    .post(requireAuth,validate(createPollSchema),handleCreatePoll);

router.get("/:pollId",validate(pollIdParamSchema),handleGetPoll)

router.patch("/:pollId/publish",requireAuth,validate(pollIdParamSchema),handlePublishPoll)
router.delete("/:pollId",requireAuth,validate(pollIdParamSchema),handleDeletePoll)

router.use("/:pollId/responses", responseRoutes);
router.use("/:pollId/analytics", analyticsRoutes);

export default router
