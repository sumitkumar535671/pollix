import {Router} from "express";

import { handleGetMe } from "./controller.js";

const router = Router();

router.get("/me",handleGetMe);

export default router;
