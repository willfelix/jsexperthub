import url from "node:url";
import http from "node:http";
import { join } from "node:path";
import fs from "node:fs/promises";

import Routes from "./routes.js";
import { logger } from "./util.js";

const PORT = 3000;
const dirName = url.fileURLToPath(new URL(import.meta.url));
const downloadsFolder = join(dirName, "../../", "downloads");

await fs.rm(downloadsFolder, { recursive: true, force: true });
await fs.mkdir(downloadsFolder);

const server = http.createServer(handler);
server.listen(PORT, startServer);

function handler(request, response) {
    const defaultRoute = async (request, response) => response.end("Hello!");

    const routes = new Routes({ downloadsFolder });
    const chosen = routes[request.method.toLowerCase()] || defaultRoute;

    return chosen.apply(routes, [request, response]);
}

function startServer() {
    const { address, port } = server.address();
    logger.info(`app running at http://${address}:${port}`);
}

// curl -X POST -F "video.mp4=@big2m.mp4" http://localhost:3000
