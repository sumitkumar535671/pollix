import { Router } from "express";

import validate from "../../shared/middlewares/validate.js";
import { pollIdParamSchema } from "./schemas.js";

import { handleGetAnalytics } from "./controller.js";

const router = Router({ mergeParams: true });

router.get("/", validate(pollIdParamSchema), handleGetAnalytics);

export default router;