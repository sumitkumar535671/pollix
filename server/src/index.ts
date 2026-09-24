import http from "node:http";
import { createServerApplication } from "./app.js";
import { connectDb } from "./shared/config/db.js";
import createSocketServer from "./shared/socket/index.js";

async function main() {
    try {
        await connectDb();
        const PORT = process.env.PORT || 8080;
        const server = http.createServer(createServerApplication());
        createSocketServer(server);

        server.listen(PORT, ()=>{
            console.log(`Server is running on port ${PORT}`);
        })
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
