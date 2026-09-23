import crypto from "crypto";

export function generateAnonymousToken(){
    return crypto.randomBytes(32).toString("hex");
}

export function hashAnonymousToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
