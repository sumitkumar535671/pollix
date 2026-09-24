import ApiError from "../utils/ApiError.js";

import type { Request, Response, NextFunction } from "express";

export default function notFoundHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    throw ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`);
}
