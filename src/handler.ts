import {BadRequestException} from "./errors";
import {Cloudflare} from "./cloudflare";
import {requireHttps, verifyParameters} from "./validation";
import {parseBasicAuth} from "./auth";

async function informAPI(
    url: URL,
    name: string,
    token: string,
): Promise<Response> {
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

    return Response.json({status: "good"}, {
        status: 200,
        headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
}


export async function handler(request: Request): Promise<Response> {
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

    return informAPI(url, username, password)
}