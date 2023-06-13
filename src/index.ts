import {Cloudflare} from "./cloudflare";
import {BadRequestException} from "./errors";
import {parseBasicAuth} from "./auth";
import {requireHttps, verifyParameters} from "./validation";


async function informAPI(url: URL, name: string, token: string): Promise<Response> {
    const hostnames = (url.searchParams.get("hostname") || "").split(",");
    const ip = url.searchParams.get("ip") || url.searchParams.get("myip");

    if (!ip) {
        throw new BadRequestException("Unable to parse IP address")
    }

    const cloudflare = new Cloudflare({token});

    const zone = await cloudflare.findZone(name);
    for (const hostname of hostnames) {
        const record = await cloudflare.findRecord(zone, hostname);
        await cloudflare.updateRecord(record, ip);
    }

    return new Response("good", {
        status: 200,
        headers: {
            "Content-Type": "text/plain;charset=UTF-8",
            "Cache-Control": "no-store",
        },
    });
}

export default {
    async fetch(request: Request) {
        requireHttps(request);

        const url = new URL(request.url);

        if (url.pathname === "/favicon.ico" || url.pathname === "/robots.txt") {
            return new Response(null, {status: 204});
        }

        if (url.pathname !== "/nic/update" && url.pathname !== "/update") {
            return new Response("Not Found.", {status: 404});
        }

        if (!request.headers.has("Authorization")) {
            throw new BadRequestException("Please provide valid credentials.");
        }

        verifyParameters(url);

        const {username, password} = parseBasicAuth(request);

        return informAPI(url, username, password).catch((err) => {
            console.error(err.constructor.name, err);
            const message = err.reason || err.stack || "Unknown Error";

            return new Response(message, {
                status: err.status || 500,
                statusText: err.statusText || null,
                headers: {
                    "Content-Type": "text/plain;charset=UTF-8",
                    "Cache-Control": "no-store",
                    "Content-Length": message.length,
                },
            });
        });
    },
};
