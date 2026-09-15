/// <reference types="@clerk/express/env" />

import type { HydratedDocument } from "mongoose";
import type { User } from "../src/modules/auth/model.js";

declare global {
    namespace Express {
        interface Request {
            user?: HydratedDocument<User>;
            validated?: {
                body?: unknown;
                query?: unknown;
                params?: unknown;
            };
        }
    }
}