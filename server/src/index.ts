import http from "node:http";
import { createServerApplication } from "./app.js";
import { connectDb } from "./shared/config/db.js";

async function main() {
    try {
        await connectDb();
        const PORT = process.env.PORT || 8080;
        const server = http.createServer(createServerApplication());

        server.listen(PORT, ()=>{
            console.log("server is running")
        })
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
