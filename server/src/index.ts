import http from "node:http";
import { createServerApplication } from "./app.js";

async function main() {
    try {
        const PORT = process.env.PORT || 8080;
        const server = http.createServer(createServerApplication());

        server.listen(PORT, ()=>{
            console.log("server is running")
        })
    } catch (error) {
        console.error(error);
    }
}

main();
