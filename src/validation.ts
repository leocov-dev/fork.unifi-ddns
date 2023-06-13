import {BadRequestException} from "./errors";

export function requireHttps(request: Request) {
    const {protocol} = new URL(request.url);
    const forwardedProtocol = request.headers.get("x-forwarded-proto");

    if (protocol !== "https:" || forwardedProtocol !== "https") {
        throw new BadRequestException("Please use a HTTPS connection.");
    }
}

export function verifyParameters(url: URL): void {
    const {searchParams} = url;

    if (!searchParams) {
        throw new BadRequestException("You must include proper query parameters");
    }

    if (!searchParams.get("hostname")) {
        throw new BadRequestException("You must specify a hostname");
    }

    if (!(searchParams.get("ip") || searchParams.get("myip"))) {
        throw new BadRequestException("You must specify an ip address");
    }
}